import * as Y from 'yjs'
import { io, Socket } from 'socket.io-client'
import { shallowRef } from 'vue'

// Usamos shallowRef para que o Vue não tente tornar as propriedades internas do Yjs reativas (isso quebraria o Yjs)
const ydoc = shallowRef(new Y.Doc())
let socket: Socket | null = null

export function useTaskCollaboration() {
  let currentTaskId: string | null = null

  function connect(taskId: string) {
    currentTaskId = taskId

    if (!socket) {
      socket = io(process.env.VITE_API_URL || 'http://localhost:3000')
    }

    socket.off('init')
    socket.off('update')

    socket.emit('join-task', taskId)

    socket.on('init', (state: number[]) => {
      // 2. O terceiro parâmetro 'server' é vital para evitar loops
      Y.applyUpdate(ydoc.value, new Uint8Array(state), 'server')
    })

    socket.on('update', (update: number[]) => {
      Y.applyUpdate(ydoc.value, new Uint8Array(update), 'server')
    })

    // 3. Escuta as mudanças locais do YDoc para enviar ao servidor
    ydoc.value.on('update', (update: Uint8Array, origin: any) => {
      // SÓ envia se a mudança não veio do servidor (evita feedback loop)
      if (origin !== 'server' && socket?.connected && currentTaskId) {
        socket.emit('update-task', {
          taskId: currentTaskId,
          update: Array.from(update),
        })
      }
    })
  }

  function disconnect() {
    if (socket) {

      socket.disconnect()
      socket = null
    }
    currentTaskId = null
    // Opcional: destruir ao desconectar também
    ydoc.value.destroy()
    ydoc.value = new Y.Doc()
  }

  return {
    ydoc, // Agora é uma Ref<Y.Doc>
    connect,
    disconnect,
  }
}