import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";

    const startTime = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      console.log(
        `[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${ip} - ${userAgent}`
      );
    });

    next();
  }
}
