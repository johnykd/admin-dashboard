import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class RegisterDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class LoginDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

@Controller('api')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.auth.register(dto.username, dto.password);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, expiresAt } = await this.auth.login(dto.username, dto.password);
    this.setAuthCookies(res, accessToken, refreshToken, expiresAt);
    return { ok: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies?.['refresh_token'] as string) || '';
    const userId = Number(req.cookies?.['user_id'] || '0');
    if (!refreshToken || !userId) return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'unauthorized' });
    const { accessToken, refreshToken: newRefresh, expiresAt } = await this.auth.rotateRefreshToken(userId, refreshToken);
    this.setAuthCookies(res, accessToken, newRefresh, expiresAt);
    return { ok: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = Number(req.cookies?.['user_id'] || '0');
    if (userId) {
      await this.auth.revokeAllUserRefreshTokens(userId);
    }
    this.clearAuthCookies(res);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.auth.findProfile(req.user.sub);
    return user;
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string, refreshExpiresAt: Date) {
    const domain = undefined;
    const secure = process.env.NODE_ENV === 'production';
    const sameSite: 'lax' | 'strict' | 'none' = secure ? 'none' : 'lax';
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
    // Store user_id so refresh can be performed without decoding refresh token (still httpOnly for safety)
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

  private clearAuthCookies(res: Response) {
    const domain = undefined;
    const secure = process.env.NODE_ENV === 'production';
    const sameSite: 'lax' | 'strict' | 'none' = secure ? 'none' : 'lax';
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

  private decodeAccess(token: string) {
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload as { sub: number };
  }
}

