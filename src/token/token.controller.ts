import { Controller, Get, Post, UseGuards, Body } from "@nestjs/common";
import { AuthenticationGuard } from "../common/guards/authentication.guard";
import { AuthorizationGuard } from "../common/guards/authorization.guard";
import { TokenTypeGuard } from "../common/guards/token-type.guard";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { Auth } from "../common/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { GetToken } from "../common/decorators/get-token.decorator";
import { IpAddress } from "../common/decorators/ip-address.decorator";
import { UserAgent } from "../common/decorators/user-agent.decorator";
import { RequireTokenType } from "../common/decorators/token-type.decorator";
import { TokenType } from "../token/entities/token.entity";
import { TokenService } from "../token/token.service";

@Controller("token")
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Public()
  @Get("public")
  getPublicData() {
    return { message: "This is public data" };
  }

  @UseGuards(AuthenticationGuard)
  @Get("protected")
  getProtectedData(@CurrentUser() user: any) {
    return {
      message: "This is protected data",
      user,
    };
  }

  @Auth("admin")
  @Get("admin")
  getAdminData(@CurrentUser() user: any) {
    return {
      message: "This is admin data",
      user,
    };
  }

  @Auth("user", "admin")
  @Get("user-or-admin")
  getUserOrAdminData(@CurrentUser() user: any) {
    return {
      message: "This is user or admin data",
      user,
    };
  }

  @UseGuards(AuthenticationGuard)
  @Get("current-user")
  getCurrentUser(@CurrentUser() user: any) {
    return { user };
  }

  @UseGuards(AuthenticationGuard)
  @Get("user-email")
  getUserEmail(@CurrentUser("email") email: string) {
    return { email };
  }

  @UseGuards(AuthenticationGuard)
  @Get("user-id")
  getUserId(@CurrentUser("sub") userId: string) {
    return { userId };
  }

  @UseGuards(AuthenticationGuard)
  @Get("token-info")
  getTokenInfo(
    @GetToken() token: string,
    @CurrentUser() user: any,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string
  ) {
    return {
      token: token ? `${token.substring(0, 20)}...` : null,
      user,
      ip,
      userAgent,
    };
  }

  @UseGuards(AuthenticationGuard, TokenTypeGuard)
  @RequireTokenType(TokenType.ACCESS)
  @Get("access-only")
  getAccessOnlyData(@CurrentUser() user: any) {
    return {
      message: "This endpoint requires access token",
      user,
    };
  }

  @UseGuards(AuthenticationGuard)
  @Post("refresh")
  async refreshToken(
    @Body("refreshToken") refreshToken: string,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string
  ) {
    return await this.tokenService.refreshAccessToken(
      refreshToken,
      ip,
      userAgent
    );
  }

  @UseGuards(AuthenticationGuard)
  @Post("logout")
  async logout(@CurrentUser("sub") userId: string) {
    await this.tokenService.logout(userId);
    return { message: "Logged out successfully" };
  }

  @UseGuards(AuthenticationGuard)
  @Post("revoke")
  async revokeToken(@GetToken() token: string) {
    await this.tokenService.revokeToken(token);
    return { message: "Token revoked successfully" };
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles("admin", "moderator")
  @Get("admin-moderator")
  getAdminModeratorData(@CurrentUser() user: any) {
    return {
      message: "This is admin or moderator data",
      user,
    };
  }
}
