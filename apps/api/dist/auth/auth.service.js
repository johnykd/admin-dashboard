"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async hashPassword(plain) {
        const saltRounds = 12;
        return bcrypt.hash(plain, saltRounds);
    }
    async verifyPassword(plain, hash) {
        return bcrypt.compare(plain, hash);
    }
    async register(username, password) {
        if (!username || !password) {
            throw new common_1.BadRequestException('username and password are required');
        }
        const exists = await this.prisma.user.findUnique({ where: { username } });
        if (exists) {
            throw new common_1.BadRequestException('username already taken');
        }
        const passwordHash = await this.hashPassword(password);
        const user = await this.prisma.user.create({ data: { username, passwordHash } });
        return { id: user.id, username: user.username };
    }
    async createRefreshToken(userId) {
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
        const rawToken = crypto.randomUUID();
        const tokenHash = await this.hashPassword(rawToken);
        const saved = await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
        return { token: rawToken, tokenId: saved.id, expiresAt };
    }
    signAccessToken(userId, username, tokenId) {
        const payload = { sub: userId, username, tokenId };
        return this.jwt.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
            expiresIn: '15m',
        });
    }
    async login(username, password) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user)
            throw new common_1.UnauthorizedException('invalid credentials');
        const ok = await this.verifyPassword(password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('invalid credentials');
        const { token: refreshToken, tokenId, expiresAt } = await this.createRefreshToken(user.id);
        const accessToken = this.signAccessToken(user.id, user.username, tokenId);
        return { accessToken, refreshToken, expiresAt };
    }
    async rotateRefreshToken(userId, presentedToken) {
        const tokens = await this.prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
        const matched = await Promise.all(tokens.map(async (t) => ({ token: t, match: await this.verifyPassword(presentedToken, t.tokenHash) })));
        const hit = matched.find((m) => m.match)?.token;
        if (!hit)
            throw new common_1.UnauthorizedException('invalid refresh token');
        if (hit.expiresAt.getTime() < Date.now())
            throw new common_1.UnauthorizedException('refresh token expired');
        await this.prisma.refreshToken.update({ where: { id: hit.id }, data: { revokedAt: new Date() } });
        const { token, tokenId, expiresAt } = await this.createRefreshToken(userId);
        const accessToken = this.signAccessToken(userId, (await this.prisma.user.findUnique({ where: { id: userId } })).username, tokenId);
        return { accessToken, refreshToken: token, expiresAt };
    }
    async revokeAllUserRefreshTokens(userId) {
        await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    async findProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        return { id: user.id, username: user.username };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map