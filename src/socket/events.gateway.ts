import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      console.log(`User ${userId} disconnected`);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("register")
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    this.connectedUsers.set(client.id, data.userId);
    client.join(`user:${data.userId}`);
    console.log(`User ${data.userId} registered with socket ${client.id}`);
    return { event: "registered", data: { userId: data.userId } };
  }

  @SubscribeMessage("message")
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any
  ) {
    return { event: "message", data };
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitOrderCreated(userId: string, order: any) {
    this.emitToUser(userId, "order:created", order);
  }

  emitOrderUpdated(userId: string, order: any) {
    this.emitToUser(userId, "order:updated", order);
  }

  emitPaymentSuccess(userId: string, order: any) {
    this.emitToUser(userId, "payment:success", order);
  }

  emitPaymentFailed(userId: string, order: any) {
    this.emitToUser(userId, "payment:failed", order);
  }

  emitCartUpdated(userId: string, cart: any) {
    this.emitToUser(userId, "cart:updated", cart);
  }

  emitStockUpdate(productId: string, stock: number) {
    this.emitToAll("product:stock-updated", { productId, stock });
  }
}
