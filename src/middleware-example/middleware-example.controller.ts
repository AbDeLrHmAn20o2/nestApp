import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";
import { Public } from "../common/decorators/public.decorator";

@Controller("middleware-example")
export class MiddlewareExampleController {
  @Public()
  @Get("public")
  getPublic() {
    return {
      message: "This is a public endpoint - no middleware required",
    };
  }

  @Get("protected")
  getProtected(@Req() req: Request) {
    return {
      message: "This endpoint is protected by AuthMiddleware",
      user: req["user"],
    };
  }

  @Get("validated")
  getValidated(@Req() req: Request) {
    return {
      message: "This endpoint uses TokenValidationMiddleware",
      user: req["user"],
    };
  }

  @Get("admin")
  getAdmin(@Req() req: Request) {
    const user = req["user"];
    return {
      message: "This endpoint is protected by AuthMiddleware",
      user,
      note: "Additional authorization logic can be added here",
    };
  }
}
