import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TokenService } from "../../token/token.service";

@Injectable()
export class TokenValidationMiddleware implements NestMiddleware {
  constructor(private tokenService: TokenService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    const isValid = await this.tokenService.isTokenValid(token);

    if (!isValid) {
      throw new UnauthorizedException("Token is invalid or expired");
    }

    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
