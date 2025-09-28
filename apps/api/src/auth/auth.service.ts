import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: number;
  username: string;
  tokenId?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async hashPassword(plain: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(plain, saltRounds);
  }

  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async register(username: string, password: string): Promise<{ id: number; username: string }> {
    if (!username || !password) {
      throw new BadRequestException('username and password are required');
    }
    const exists = await this.prisma.user.findUnique({ where: { username } });
    if (exists) {
      throw new BadRequestException('username already taken');
    }
    const passwordHash = await this.hashPassword(password);
    const user = await this.prisma.user.create({ data: { username, passwordHash } });
    return { id: user.id, username: user.username };
  }

  private async createRefreshToken(userId: number): Promise<{ token: string; tokenId: number; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const rawToken = crypto.randomUUID();
    const tokenHash = await this.hashPassword(rawToken);
    const saved = await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
    return { token: rawToken, tokenId: saved.id, expiresAt };
  }

  private signAccessToken(userId: number, username: string, tokenId: number): string {
    const payload: JwtPayload = { sub: userId, username, tokenId };
    return this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
      expiresIn: '15m',
    });
  }

  async login(username: string, password: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('invalid credentials');
    const ok = await this.verifyPassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    const { token: refreshToken, tokenId, expiresAt } = await this.createRefreshToken(user.id);
    const accessToken = this.signAccessToken(user.id, user.username, tokenId);
    return { accessToken, refreshToken, expiresAt };
  }

  async rotateRefreshToken(userId: number, presentedToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const tokens = await this.prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
    const matched = await Promise.all(
      tokens.map(async (t) => ({ token: t, match: await this.verifyPassword(presentedToken, t.tokenHash) }))
    );
    const hit = matched.find((m) => m.match)?.token;
    if (!hit) throw new UnauthorizedException('invalid refresh token');
    if (hit.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('refresh token expired');
    await this.prisma.refreshToken.update({ where: { id: hit.id }, data: { revokedAt: new Date() } });

    const { token, tokenId, expiresAt } = await this.createRefreshToken(userId);
    const accessToken = this.signAccessToken(userId, (await this.prisma.user.findUnique({ where: { id: userId } }))!.username, tokenId);
    return { accessToken, refreshToken: token, expiresAt };
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async findProfile(userId: number): Promise<{ id: number; username: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, username: user.username };
  }
}

