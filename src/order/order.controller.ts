import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AuthenticationGuard } from "../common/guards/authentication.guard";
import { AuthorizationGuard } from "../common/guards/authorization.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("orders")
@UseGuards(AuthenticationGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @CurrentUser("sub") userId: string,
    @Body() createOrderDto: CreateOrderDto
  ) {
    const order = await this.orderService.create(userId, createOrderDto);
    return {
      message: "Order created successfully",
      order,
    };
  }

  @Get()
  @UseGuards(AuthorizationGuard)
  @Roles("admin")
  async findAll() {
    const orders = await this.orderService.findAll();
    return {
      orders,
      count: orders.length,
    };
  }

  @Get("my-orders")
  async findUserOrders(@CurrentUser("sub") userId: string) {
    const orders = await this.orderService.findUserOrders(userId);
    return {
      orders,
      count: orders.length,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const order = await this.orderService.findOne(id);
    return {
      order,
    };
  }

  @Patch(":id/status")
  @UseGuards(AuthorizationGuard)
  @Roles("admin")
  async updateStatus(
    @Param("id") id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto
  ) {
    const order = await this.orderService.updateStatus(
      id,
      updateOrderStatusDto.status
    );
    return {
      message: "Order status updated",
      order,
    };
  }

  @Post(":id/refund")
  @UseGuards(AuthorizationGuard)
  @Roles("admin")
  async refund(@Param("id") id: string) {
    const order = await this.orderService.refundOrder(id);
    return {
      message: "Order refunded successfully",
      order,
    };
  }
}
