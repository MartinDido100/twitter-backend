import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class MessageDTO {
  constructor (message: MessageDTO) {
    this.id = message.id
    this.content = message.content
    this.createdAt = message.createdAt
    this.receiverId = message.receiverId
  }

  id!: string
  senderId!: string
  receiverId!: string
  content!: string
  createdAt!: Date
}

export class CreateMessageInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
    content!: string

  @IsString()
  @IsNotEmpty()
    receiverId!: string
}
