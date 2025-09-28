import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export interface JwtPayload {
    sub: number;
    username: string;
    tokenId?: number;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    private hashPassword;
    private verifyPassword;
    register(username: string, password: string): Promise<{
        id: number;
        username: string;
    }>;
    private createRefreshToken;
    private signAccessToken;
    login(username: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    }>;
    rotateRefreshToken(userId: number, presentedToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    }>;
    revokeAllUserRefreshTokens(userId: number): Promise<void>;
    findProfile(userId: number): Promise<{
        id: number;
        username: string;
    }>;
}
