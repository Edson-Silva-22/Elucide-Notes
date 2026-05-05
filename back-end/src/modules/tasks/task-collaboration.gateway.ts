import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import * as Y from 'yjs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Task } from '../tasks/entities/task.entity'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TaskCollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('TaskCollaborationGateway');
  private server: Server = new Server();
  private docs = new Map<string, Y.Doc>()
  private loadingDocs = new Map<string, Promise<Y.Doc>>();
  private saveTimeouts = new Map<string, NodeJS.Timeout>()

  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<Task>,
  ) {}

  // =========================
  // 🔌 CONEXÃO
  // =========================

  handleConnection(client: Socket) {
    this.logger.log('Client conectado:', client.id)
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client conectado:', client.id);
    
    // Percorrer os documentos para ver se a sala ficou vazia
    for (const [taskId, ydoc] of this.docs.entries()) {
      const roomName = `task-${taskId}`;
      const room = this.server.sockets.adapter.rooms.get(roomName);

      if (!room || room.size === 0) {
        // Se não há ninguém, garantimos o save final e limpamos a RAM
        this.forceImmediateSave(taskId, ydoc);
        this.docs.delete(taskId);
        this.saveTimeouts.delete(taskId);
        this.logger.log(`Memória liberada para a task: ${taskId}`);
      }
    }
  }

  private async forceImmediateSave(taskId: string, ydoc: Y.Doc) {
    const state = Y.encodeStateAsUpdate(ydoc);
    await this.taskModel.findByIdAndUpdate(taskId, {
      description: Buffer.from(state),
    });
  }

  // =========================
  // 📄 ENTRAR NA TASK
  // =========================

  @SubscribeMessage('join-task')
  async handleJoinTask(
    @MessageBody() taskId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const docId = `task-${taskId}`

    client.join(docId)
    this.logger.log(`Client ${client.id} entrou na task ${taskId}`)
    const ydoc = await this.getOrCreateDoc(taskId)

    // envia estado inicial
    const state = Y.encodeStateAsUpdate(ydoc)
    client.emit('init', state)
  }

  // =========================
  // ✏️ UPDATE
  // =========================

  @SubscribeMessage('update-task')
  async handleUpdateTask(
    @MessageBody() payload: { taskId: string; update: Buffer }, // NestJS converte binário para Buffer automaticamente
    @ConnectedSocket() client: Socket,
  ) {
    const { taskId, update } = payload;
    const ydoc = await this.getOrCreateDoc(taskId);

    Y.applyUpdate(ydoc, new Uint8Array(update));

    // Envia como binário para os outros
    client.to(`task-${taskId}`).emit('update', update);

    this.scheduleSave(taskId, ydoc);
  }

  // =========================
  // 🧠 DOC
  // =========================

  private async getOrCreateDoc(taskId: string): Promise<Y.Doc> {
    // Se o doc já está na memória, retorna
    if (this.docs.has(taskId)) return this.docs.get(taskId)!;

    // Se o doc está sendo carregado do MongoDB por outra requisição simultânea, aguarda a mesma promessa
    if (this.loadingDocs.has(taskId)) return this.loadingDocs.get(taskId)!;

    const loadPromise = (async () => {
      const ydoc = new Y.Doc();
      const task = await this.taskModel.findById(taskId).exec();
      
      if (task?.description) {
        // Importante: O MongoDB retorna um Buffer, que o Yjs aceita como Uint8Array
        Y.applyUpdate(ydoc, new Uint8Array(task.description));
      }
      
      this.docs.set(taskId, ydoc);
      this.loadingDocs.delete(taskId); // Limpa o estado de carregamento
      return ydoc;
    })();

    this.loadingDocs.set(taskId, loadPromise);
    return loadPromise;
  }

  // =========================
  // 💾 SAVE (DEBOUNCE)
  // =========================

  private scheduleSave(taskId: string, ydoc: Y.Doc) {
    if (this.saveTimeouts.has(taskId)) {
      clearTimeout(this.saveTimeouts.get(taskId))
    }

    const timeout = setTimeout(async () => {
      const state = Y.encodeStateAsUpdate(ydoc)

      await this.taskModel.findByIdAndUpdate(taskId, {
        description: Buffer.from(state),
      })

      this.logger.log(`Task ${taskId} salva`)
    }, 2000)

    this.saveTimeouts.set(taskId, timeout)
  }
}