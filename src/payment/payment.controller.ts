import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { AuthenticationGuard } from "../common/guards/authentication.guard";
import { AuthorizationGuard } from "../common/guards/authorization.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("create-intent/:orderId")
  @UseGuards(AuthenticationGuard)
  async createPaymentIntent(@Param("orderId") orderId: string) {
    const result = await this.paymentService.createPaymentIntent(orderId);
    return {
      message: "Payment intent created",
      ...result,
    };
  }

  @Post("webhook")
  async handleWebhook(
    @Headers("stripe-signature") signature: string,
    @Req() request: RawBodyRequest<Request>
  ) {
    const payload = request.rawBody;
    await this.paymentService.handleWebhook(signature, payload);
    return { received: true };
  }

  @Post("refund/:orderId")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles("admin")
  async refund(@Param("orderId") orderId: string) {
    await this.paymentService.refund(orderId);
    return {
      message: "Refund processed successfully",
    };
  }
}
