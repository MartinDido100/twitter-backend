import { ConflictException, db, NotFoundException, socketAuth, validateSocketInput } from '@utils'
import { Server as HttpServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'
import { FollowRepositoryImpl } from '@domains/follow'
import { MessageRepositoryImpl } from '@domains/message'
import { CreateMessageInputDTO } from '@domains/message/dto'
import { SocketEvents } from '../dto'
import { SocketServiceImpl } from '../service'
import { UserRepositoryImpl } from '@domains/user/repository'

const service = new SocketServiceImpl(new FollowRepositoryImpl(db), new MessageRepositoryImpl(db), new UserRepositoryImpl(db))

export function socketInit (server: HttpServer): SocketServer {
  const ioServer = new SocketServer(server)

  ioServer.use(socketAuth)
  ioServer.on('connection', async (socket) => {
    console.log('New client connection', socket.id)

    socket.on(SocketEvents.NewMessage, async (data: CreateMessageInputDTO, res) => {
      const inputError = await validateSocketInput(CreateMessageInputDTO, data)
      if (inputError) {
        // Sent an acknowledgement callback
        return res({ success: false, error: inputError })
      }

      const { userId } = socket.data.context

      const receiverExists = await service.checkReceiverExistance(data.receiverId)
      if (!receiverExists) {
        return res({ success: false, error: new NotFoundException('user') })
      }

      const following = await service.checkFollows(userId, data.receiverId)

      if (!following) {
        return res({ success: false, error: new ConflictException('USERS_NOT_FOLLOWNG_EACHOTHER') })
      }

      const connectedSockets = await ioServer.fetchSockets()

      const socketToSend = connectedSockets.find((socket) => socket.data.context.userId === data.receiverId)

      const newMessage = await service.createMessage(userId, data)
      if (socketToSend !== undefined) {
        res({ success: true, newMessage })
        socket.to(socketToSend.id).emit(SocketEvents.ReceiveMessage, { success: true, newMessage })
      } else {
        res({ success: true, newMessage })
      }
    })
  })

  return ioServer
}
