import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Otp } from "./entities/otp.entity";
import { OtpRepository } from "./repositories/otp.repository";
import { OtpService } from "./otp.service";
import { OtpHooksService } from "./otp-hooks.service";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), MailModule],
  providers: [OtpRepository, OtpService, OtpHooksService],
  exports: [OtpService, OtpRepository],
})
export class OtpModule {}
