import { Injectable, OnModuleInit } from "@nestjs/common";
import { TokenRepository } from "./repositories/token.repository";

@Injectable()
export class TokenCleanupService implements OnModuleInit {
  constructor(private tokenRepository: TokenRepository) {}

  onModuleInit() {
    this.scheduleCleanup();
  }

  private scheduleCleanup() {
    this.tokenRepository.deleteExpiredTokens();

    setInterval(async () => {
      await this.tokenRepository.deleteExpiredTokens();
    }, 3600000);
  }
}
