
export class SendMessageInputDTO {
  constructor (data: SendMessageInputDTO) {
    this.content = data.content
    this.to = data.to
  }

  content!: string
  to!: string
}

export enum SocketEvents {
  NewMessage = 'newMessage',
  ReceiveMessage = 'receiveMessage'
}
