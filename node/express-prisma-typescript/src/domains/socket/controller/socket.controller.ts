import { socketAuth } from '@utils'
import { Server as HttpServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'

export function socketInit (server: HttpServer): SocketServer {
  const ioServer = new SocketServer(server)

  ioServer.use(socketAuth)

  ioServer.on('connection', async socket => {
    console.log('New client connection', socket.data.context)
  })

  return ioServer
}
