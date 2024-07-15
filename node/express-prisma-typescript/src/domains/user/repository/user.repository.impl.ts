import { SignupInputDTO } from '@domains/auth/dto'
import { PrismaClient } from '@prisma/client'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from './user.repository'

export class UserRepositoryImpl implements UserRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (data: SignupInputDTO): Promise<UserDTO> {
    const user = await this.db.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password
      }
    })

    return new UserDTO(user)
  }

  async getById (userId: any): Promise<UserViewDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user !== null ? new UserViewDTO(user) : null
  }

  async delete (userId: any): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId
      }
    })
  }

  async getRecommendedUsersPaginated (userId: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    const following = await this.db.user.findMany({
      where: {
        followers: {
          some: {
            id: userId
          }
        }
      },
      select: {
        id: true
      }
    })

    const users = await this.db.user.findMany({
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          id: 'asc'
        }
      ],
      where: {
        followers: {
          some: {
            id: {
              in: following.map(user => user.id)
            }
          }
        }
      }
    })

    return users.map(user => new UserViewDTO(user))
  }

  async getByEmailOrUsername (email?: string, username?: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email
          },
          {
            username
          }
        ]
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async isPrivateUser (userId: any): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        isPrivate: true
      }
    })

    return user ? user.isPrivate : false
  }

  async privateUser (userId: any): Promise<void> {
    await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        isPrivate: true
      }
    })
  }

  async unprivateUser (userId: any): Promise<void> {
    await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        isPrivate: false
      }
    })
  }

  async updateProfilePicture (userId: string, extension: string): Promise <UserDTO> {
    return await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        profilePicture: `profile/${userId}.${extension}`
      }
    })
  }
}
