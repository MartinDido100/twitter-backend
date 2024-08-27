export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string | null
  createdAt: Date
  profilePicture: string | null
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}

export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string | null
  username: string
  profilePicture: string | null
}

export class ExtendedUserViewDTO extends UserViewDTO {
  constructor (user: ExtendedUserViewDTO) {
    super(user)
    this.followsYou = user.followsYou
    this.following = user.following
  }

  followsYou!: boolean
  following!: boolean
}

export enum AllowedExtensions {
  PNG = 'png',
  JPG = 'jpg',
  JPEG = 'jpeg'
}
