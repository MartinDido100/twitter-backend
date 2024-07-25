import { CommentService, CommentServiceImpl } from '@domains/comment'
import { followRepositoryMock, postRepositoryMock, userRepositoryMock } from '../mock'
import { commentRepositoryMock } from './comment.mock'
import { CreatePostInputDTO } from '@domains/post/dto'
import { CommentDTO } from '@domains/comment/dto'
import { ForbiddenException, NotFoundException } from '@utils'

describe('Comment service tests', () => {
  let service: CommentService

  beforeEach(() => {
    service = new CommentServiceImpl(commentRepositoryMock, followRepositoryMock, userRepositoryMock, postRepositoryMock)
    jest.resetAllMocks()
  })

  describe('Comment post method', () => {
    it('should return an array of comments if author has public profile', async () => {
      // given
      const userId = 'userId'
      const postId = 'postId'
      const body: CreatePostInputDTO = {
        content: 'Comment content'
      }

      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        content: 'Post content',
        images: [],
        createdAt: new Date(),
        authorId: 'authorId'
      })

      commentRepositoryMock.commentPost.mockResolvedValue({
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: [],
        createdAt: new Date(),
        parentId: postId
      })

      const expected: CommentDTO = {
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: [],
        createdAt: new Date(),
        parentId: postId
      }

      // when
      const result = await service.commentPost(userId, postId, body)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(1)
      expect(postRepositoryMock.getById).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expected)
    })

    it('should return an array of comments if author has private profile but logged user is following him', async () => {
      // given
      const userId = 'userId'
      const postId = 'postId'
      const body: CreatePostInputDTO = {
        content: 'Comment content'
      }

      followRepositoryMock.checkFollow.mockResolvedValue(true)
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        content: 'Post content',
        images: [],
        createdAt: new Date(),
        authorId: 'authorId'
      })

      commentRepositoryMock.commentPost.mockResolvedValue({
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: [],
        createdAt: new Date(),
        parentId: postId
      })

      const expected: CommentDTO = {
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: [],
        createdAt: new Date(),
        parentId: postId
      }

      // when
      const result = await service.commentPost(userId, postId, body)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
      expect(postRepositoryMock.getById).toHaveBeenCalledTimes(1)
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expected)
    })

    it('should throw NotFoundException if post to comment was not found', async () => {
      // given
      const userId = 'userId'
      const postId = 'postId'
      const body: CreatePostInputDTO = {
        content: 'Comment content'
      }

      followRepositoryMock.checkFollow.mockResolvedValue(true)
      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

      postRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.commentPost(userId, postId, body)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find post" })
      }
    })

    it('should throw ForbiddenExeption post author has private profile and logged user is not following the author', async () => {
      // given
      const userId = 'userId'
      const postId = 'postId'
      const body: CreatePostInputDTO = {
        content: 'Comment content'
      }

      followRepositoryMock.checkFollow.mockResolvedValue(false)
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        content: 'Post content',
        images: [],
        createdAt: new Date(),
        authorId: 'authorId'
      })

      try {
        // when
        await service.commentPost(userId, postId, body)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ForbiddenException)
        expect(e).toMatchObject({ message: 'Forbidden. You are not allowed to perform this action' })
      }
    })
  })

  describe('getCommentsByUser method', () => {
    it('should return an array of comments if author has public profile', async () => {
      const userId = 'userId'
      const loggedUserId = 'loggedId'

      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        name: 'name',
        username: 'username',
        profilePicture: null
      })

      commentRepositoryMock.getCommentsByUser.mockResolvedValue([
        {
          id: 'commentId1',
          authorId: userId,
          content: 'Comment content 1',
          images: [],
          createdAt: new Date(),
          parentId: 'postId1'
        },
        {
          id: 'commentId2',
          authorId: userId,
          content: 'Comment content 2',
          images: [],
          createdAt: new Date(),
          parentId: 'postId2'
        }
      ])

      const expected: CommentDTO[] = [
        {
          id: 'commentId1',
          authorId: userId,
          content: 'Comment content 1',
          images: [],
          createdAt: new Date(),
          parentId: 'postId1'
        },
        {
          id: 'commentId2',
          authorId: userId,
          content: 'Comment content 2',
          images: [],
          createdAt: new Date(),
          parentId: 'postId2'
        }
      ]

      // when
      const result = await service.getCommentsByUser(loggedUserId, userId)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
      expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1)
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expected)
    })

    it('should return an array of comments if author has private profile but logged user is following him', async () => {
      const userId = 'userId'
      const loggedUserId = 'loggedId'

      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(true)

      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        name: 'name',
        username: 'username',
        profilePicture: null
      })

      commentRepositoryMock.getCommentsByUser.mockResolvedValue([
        {
          id: 'commentId1',
          authorId: userId,
          content: 'Comment content 1',
          images: [],
          createdAt: new Date(),
          parentId: 'postId1'
        },
        {
          id: 'commentId2',
          authorId: userId,
          content: 'Comment content 2',
          images: [],
          createdAt: new Date(),
          parentId: 'postId2'
        }
      ])

      const expected: CommentDTO[] = [
        {
          id: 'commentId1',
          authorId: userId,
          content: 'Comment content 1',
          images: [],
          createdAt: new Date(),
          parentId: 'postId1'
        },
        {
          id: 'commentId2',
          authorId: userId,
          content: 'Comment content 2',
          images: [],
          createdAt: new Date(),
          parentId: 'postId2'
        }
      ]

      // when
      const result = await service.getCommentsByUser(loggedUserId, userId)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
      expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1)
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expected)
    })

    it('should throw NotFoundException if user to search comments was not found', async () => {
      // given
      const userId = 'userId'
      const loggedUserId = 'loggedId'

      userRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.getCommentsByUser(loggedUserId, userId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find user" })
      }
    })

    it('should throw ForbiddenExeption user to search has private profile and logged user is not following the author', async () => {
      // given
      const userId = 'userId'
      const loggedUserId = 'loggedId'

      followRepositoryMock.checkFollow.mockResolvedValue(false)
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)

      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        name: 'name',
        username: 'username',
        profilePicture: null
      })

      try {
        // when
        await service.getCommentsByUser(loggedUserId, userId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ForbiddenException)
        expect(e).toMatchObject({ message: 'Forbidden. You are not allowed to perform this action' })
      }
    })
  })
})
