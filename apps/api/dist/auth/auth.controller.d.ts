import { AuthService } from './auth.service';
import { Request, Response } from 'express';
declare class RegisterDto {
    username: string;
    password: string;
}
declare class LoginDto {
    username: string;
    password: string;
}
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        id: number;
        username: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        ok: boolean;
    }>;
    refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>> | {
        ok: boolean;
    }>;
    logout(req: Request, res: Response): Promise<{
        ok: boolean;
    }>;
    me(req: any): Promise<{
        id: number;
        username: string;
    }>;
    private setAuthCookies;
    private clearAuthCookies;
    private decodeAccess;
}
export {};
