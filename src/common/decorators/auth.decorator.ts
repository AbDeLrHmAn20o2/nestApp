import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthenticationGuard } from "../guards/authentication.guard";
import { AuthorizationGuard } from "../guards/authorization.guard";
import { Roles } from "./roles.decorator";

export function Auth(...roles: string[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard)
  );
}
