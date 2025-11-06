import { Controller, Get, Post, Delete, UseGuards, Body } from "@nestjs/common";
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

@Controller("authorization-example")
export class AuthorizationExampleController {
  @Public()
  @Get("public")
  getPublicData() {
    return {
      message: "This is a public endpoint accessible without authentication",
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(AuthenticationGuard)
  @Get("authenticated")
  getAuthenticatedData(@CurrentUser() user: any) {
    return {
      message: "This endpoint requires authentication",
      user,
    };
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles("admin")
  @Get("admin-only")
  getAdminOnlyData(@CurrentUser() user: any) {
    return {
      message: "This endpoint is restricted to admin users only",
      user,
    };
  }

  @Auth("admin")
  @Get("admin-composition")
  getAdminWithComposition(@CurrentUser() user: any) {
    return {
      message: "Using @Auth composition decorator for admin access",
      user,
    };
  }

  @Auth("user", "admin")
  @Get("multi-role")
  getMultiRoleData(@CurrentUser() user: any) {
    return {
      message: "This endpoint allows multiple roles: user or admin",
      user,
    };
  }

  @Auth("moderator", "admin")
  @Post("moderate")
  moderateContent(@CurrentUser() user: any, @Body() data: any) {
    return {
      message: "Content moderation action performed",
      moderator: user,
      action: data,
    };
  }

  @Auth("admin")
  @Delete("delete-resource")
  deleteResource(
    @CurrentUser() user: any,
    @Body("resourceId") resourceId: string
  ) {
    return {
      message: "Resource deleted by admin",
      admin: user,
      resourceId,
    };
  }

  @UseGuards(AuthenticationGuard)
  @Get("user-info")
  getUserInfo(
    @CurrentUser() user: any,
    @CurrentUser("email") email: string,
    @CurrentUser("sub") userId: string
  ) {
    return {
      fullUser: user,
      email,
      userId,
    };
  }

  @UseGuards(AuthenticationGuard)
  @Get("request-context")
  getRequestContext(
    @CurrentUser() user: any,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @GetToken() token: string
  ) {
    return {
      user,
      ip,
      userAgent,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
    };
  }

  @UseGuards(AuthenticationGuard, TokenTypeGuard)
  @RequireTokenType(TokenType.ACCESS)
  @Get("access-token-only")
  getAccessTokenOnlyData(@CurrentUser() user: any) {
    return {
      message: "This endpoint specifically requires an ACCESS token",
      user,
      tokenType: "access",
    };
  }

  @UseGuards(AuthenticationGuard, TokenTypeGuard)
  @RequireTokenType(TokenType.REFRESH)
  @Get("refresh-token-only")
  getRefreshTokenOnlyData(@CurrentUser() user: any) {
    return {
      message: "This endpoint specifically requires a REFRESH token",
      user,
      tokenType: "refresh",
    };
  }

  @Auth("admin", "superadmin")
  @Get("sensitive-data")
  getSensitiveData(@CurrentUser() user: any, @IpAddress() ip: string) {
    return {
      message: "Accessing sensitive data",
      user,
      accessedFrom: ip,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get("metadata-example")
  getMetadataExample() {
    return {
      message: "Demonstrating metadata decorators",
      features: [
        "@Public() - Bypasses authentication",
        "@Roles(...roles) - Sets required roles metadata",
        "@Auth(...roles) - Composition decorator combining authentication + authorization",
        "@RequireTokenType(type) - Sets required token type metadata",
        "@CurrentUser() - Parameter decorator to extract user",
        "@GetToken() - Parameter decorator to extract token",
        "@IpAddress() - Parameter decorator to extract IP",
        "@UserAgent() - Parameter decorator to extract user agent",
      ],
    };
  }
}
