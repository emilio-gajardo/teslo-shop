import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({ payload });

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado: ', client.id);
    // console.log({ clientesDesconectados: this.messagesWsService.getConnectedClients() });
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  // message-from-client
  @SubscribeMessage('message-from-client')
  async onMessageFromClient(client: Socket, payload: NewMessageDto) {
    // console.log(client.id, payload);

    //! Emite unicamente al cliente
    // client.emit('message-from-server', {
    //   fullName: 'servidor',
    //   message: payload.message || 'servidor sin mensajes'
    // });

    //! Emite a todos menos al cliente de origen
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'servidor',
    //   message: payload.message || 'servidor sin mensajes'
    // });

    //! Emite a todos los clientes sin distincion
    this.wss.emit('message-from-server', {
      fullname: this.messagesWsService.getUserFullNameBySocketId(client.id),
      message: payload.message || 'servidor sin mensajes'
    });
  }

}
