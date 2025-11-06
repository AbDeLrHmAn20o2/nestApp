import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { TOKEN_TYPE_KEY } from "../decorators/token-type.decorator";
import { TokenType } from "../../token/entities/token.entity";

@Injectable()
export class TokenTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredType = this.reflector.getAllAndOverride<TokenType>(
      TOKEN_TYPE_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.type !== requiredType) {
      throw new UnauthorizedException(
        `Invalid token type. Expected: ${requiredType}`
      );
    }

    return true;
  }
}
