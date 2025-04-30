import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true },
})
export class ProfileUpdateGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const engineerId = parseInt(client.handshake.query.engineerId as string, 10);
    if (engineerId) {
      client.join(`eng_${engineerId}`);
      
    } else {
      
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {}

  notifyProfileUpdate(engineerId: number, status: string, message: string, taskId: string) {
    this.server.to(`eng_${engineerId}`).emit('profileUpdate', { taskId, status, message });
    
  }
}