import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { OtpRepository } from "./repositories/otp.repository";
import { MailService } from "../mail/mail.service";

@Injectable()
export class OtpService {
  constructor(
    private otpRepository: OtpRepository,
    private mailService: MailService
  ) {}

  generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async hashOtp(otp: string): Promise<string> {
    return await bcrypt.hash(otp, 10);
  }

  async createOtp(email: string, type: string): Promise<string> {
    const otp = this.generateOtp();
    const otpHash = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.otpRepository.create({
      email,
      otpHash,
      type,
      expiresAt,
    });

    return otp;
  }

  async verifyOtp(email: string, otp: string, type: string): Promise<boolean> {
    const otpRecords = await this.otpRepository.findByEmail(email, type);

    for (const record of otpRecords) {
      if (new Date() > record.expiresAt) {
        continue;
      }

      const isValid = await bcrypt.compare(otp, record.otpHash);
      if (isValid) {
        await this.otpRepository.markAsUsed(record.id);
        return true;
      }
    }

    return false;
  }

  async sendOtpEmail(email: string, otp: string, type: string): Promise<void> {
    await this.mailService.sendOtp(email, otp, type);
  }

  async createAndSendOtp(email: string, type: string): Promise<void> {
    const otp = await this.createOtp(email, type);
    await this.sendOtpEmail(email, otp, type);
  }
}
