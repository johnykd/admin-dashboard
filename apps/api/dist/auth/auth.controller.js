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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
class RegisterDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class LoginDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
let AuthController = class AuthController {
    constructor(auth) {
        this.auth = auth;
    }
    async register(dto) {
        const user = await this.auth.register(dto.username, dto.password);
        return user;
    }
    async login(dto, res) {
        const { accessToken, refreshToken, expiresAt } = await this.auth.login(dto.username, dto.password);
        this.setAuthCookies(res, accessToken, refreshToken, expiresAt);
        return { ok: true };
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.['refresh_token'] || '';
        const userId = Number(req.cookies?.['user_id'] || '0');
        if (!refreshToken || !userId)
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json({ message: 'unauthorized' });
        const { accessToken, refreshToken: newRefresh, expiresAt } = await this.auth.rotateRefreshToken(userId, refreshToken);
        this.setAuthCookies(res, accessToken, newRefresh, expiresAt);
        return { ok: true };
    }
    async logout(req, res) {
        const userId = Number(req.cookies?.['user_id'] || '0');
        if (userId) {
            await this.auth.revokeAllUserRefreshTokens(userId);
        }
        this.clearAuthCookies(res);
        return { ok: true };
    }
    async me(req) {
        const user = await this.auth.findProfile(req.user.sub);
        return user;
    }
    setAuthCookies(res, accessToken, refreshToken, refreshExpiresAt) {
        const domain = undefined;
        const secure = process.env.NODE_ENV === 'production';
        const sameSite = secure ? 'none' : 'lax';
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure,
            sameSite,
            path: '/',
            maxAge: 15 * 60 * 1000,
            domain,
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure,
            sameSite,
            path: '/',
            expires: refreshExpiresAt,
            domain,
        });
        res.cookie('user_id', '', { maxAge: 0, httpOnly: true });
        res.cookie('user_id', String(this.decodeAccess(accessToken).sub), {
            httpOnly: true,
            secure,
            sameSite,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain,
        });
    }
    clearAuthCookies(res) {
        const domain = undefined;
        const secure = process.env.NODE_ENV === 'production';
        const sameSite = secure ? 'none' : 'lax';
        for (const name of ['access_token', 'refresh_token', 'user_id']) {
            res.cookie(name, '', {
                httpOnly: true,
                secure,
                sameSite,
                path: '/',
                maxAge: 0,
                domain,
            });
        }
    }
    decodeAccess(token) {
        const parts = token.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        return payload;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map