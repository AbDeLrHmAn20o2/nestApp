import { Injectable, OnModuleInit } from "@nestjs/common";
import { OtpRepository } from "./repositories/otp.repository";

@Injectable()
export class OtpHooksService implements OnModuleInit {
  constructor(private otpRepository: OtpRepository) {}

  async onModuleInit() {
    await this.cleanupExpiredOtps();
    this.scheduleCleanup();
  }

  private async cleanupExpiredOtps() {
    await this.otpRepository.deleteExpired();
  }

  private scheduleCleanup() {
    setInterval(async () => {
      await this.cleanupExpiredOtps();
    }, 15 * 60 * 1000);
  }
}
