import { SetMetadata } from "@nestjs/common";
import { TokenType } from "../../token/entities/token.entity";

export const TOKEN_TYPE_KEY = "tokenType";
export const RequireTokenType = (type: TokenType) =>
  SetMetadata(TOKEN_TYPE_KEY, type);
