import { CommentService, CommentServiceImpl } from '@domains/comment'
import { bucketManagerMock, followRepositoryMock, postRepositoryMock, userRepositoryMock } from '../mock'
import { commentRepositoryMock } from './comment.mock'
import { CreatePostInputDTO } from '@domains/post/dto'
import { CommentDTO, ExtendedCommentDTO } from '@domains/comment/dto'
import { ForbiddenException, NotFoundException } from '@utils'
import { UserViewDTO } from '@domains/user/dto'

describe('Comment service tests', () => {
  let service: CommentService

  beforeEach(() => {
    service = new CommentServiceImpl(commentRepositoryMock, followRepositoryMock, userRepositoryMock, postRepositoryMock, bucketManagerMock)
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

      const createdAt = new Date()

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        content: 'Post content',
        images: [],
        createdAt,
        authorId: 'authorId'
      })

      commentRepositoryMock.commentPost.mockResolvedValue({
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: [],
        createdAt,
        parentId: postId
      })

      const expected: CommentDTO = {
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: [],
        createdAt,
        parentId: postId
      }

      // when
      const result = await service.commentPost(userId, postId, body)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
      expect(result).toEqual(expected)
    })

    it('should return an array of comments if author has private profile but logged user is following him', async () => {
      // given
      const userId = 'userId'
      const postId = 'postId'
      const body: CreatePostInputDTO = {
        content: 'Comment content'
      }

      const createdAt = new Date()

      followRepositoryMock.checkFollow.mockResolvedValue(true)
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        content: 'Post content',
        images: [],
        createdAt,
        authorId: 'authorId'
      })

      commentRepositoryMock.commentPost.mockResolvedValue({
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: [],
        createdAt,
        parentId: postId
      })

      const expected: CommentDTO = {
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: [],
        createdAt,
        parentId: postId
      }

      // when
      const result = await service.commentPost(userId, postId, body)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(bucketManagerMock.putImage).toHaveBeenCalledTimes(0)
      expect(result).toEqual(expected)
    })

    it('should generate images urls if comment has images', async () => {
      // given
      const userId = 'userId'
      const postId = 'postId'
      const body: CreatePostInputDTO = {
        content: 'Comment content',
        images: ['image1.jpg', 'image2.jpg']
      }

      const createdAt = new Date()

      followRepositoryMock.checkFollow.mockResolvedValue(true)
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        content: 'Post content',
        images: [],
        createdAt,
        authorId: 'authorId'
      })

      commentRepositoryMock.commentPost.mockResolvedValue({
        id: 'commentId',
        authorId: 'authorId',
        content: body.content,
        images: ['image1.jpg', 'imag2.jpg'],
        createdAt,
        parentId: postId
      })

      // when
      await service.commentPost(userId, postId, body)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(bucketManagerMock.putImage).toHaveBeenCalledTimes(2)
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
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(0)
        expect(postRepositoryMock.getById).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw ForbiddenExeption post author has private profile and logged user is not following the author', async () => {
      // given
      const userId = 'userId'
      const postId = 'postId'
      const createdAt = new Date()
      const body: CreatePostInputDTO = {
        content: 'Comment content'
      }

      followRepositoryMock.checkFollow.mockResolvedValue(false)
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        content: 'Post content',
        images: [],
        createdAt,
        authorId: 'authorId'
      })

      try {
        // when
        await service.commentPost(userId, postId, body)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ForbiddenException)
        expect(e).toMatchObject({ message: 'Forbidden. You are not allowed to perform this action' })
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(1)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
        expect(postRepositoryMock.getById).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('getCommentsByUser method', () => {
    it('should return an array of comments if author has public profile', async () => {
      const userId = 'userId'
      const loggedUserId = 'loggedId'
      const createdAt = new Date()

      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        name: 'name',
        username: 'username',
        profilePicture: null
      })

      bucketManagerMock.getImage.mockResolvedValue('url')

      commentRepositoryMock.getCommentsByUser.mockResolvedValue([
        {
          id: 'commentId1',
          authorId: userId,
          content: 'Comment content 1',
          images: ['image1.png', 'image2.png'],
          createdAt,
          parentId: 'postId1',
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          author: {
            id: userId,
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        },
        {
          id: 'commentId2',
          authorId: userId,
          content: 'Comment content 2',
          images: ['image3.jpeg'],
          createdAt,
          parentId: 'postId2',
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          author: {
            id: userId,
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        }
      ])

      const expected: ExtendedCommentDTO[] = [
        {
          id: 'commentId1',
          authorId: userId,
          content: 'Comment content 1',
          images: ['url', 'url'],
          createdAt,
          parentId: 'postId1',
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          author: {
            id: userId,
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        },
        {
          id: 'commentId2',
          authorId: userId,
          content: 'Comment content 2',
          images: ['url'],
          createdAt,
          parentId: 'postId2',
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          author: {
            id: userId,
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        }
      ]

      // when
      const result = await service.getCommentsByUser(loggedUserId, userId)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(userRepositoryMock.getById).toHaveBeenCalled()
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(3)
      expect(result).toEqual(expected)
    })

    it('should return an array of comments if author has private profile but logged user is following him', async () => {
      const userId = 'userId'
      const loggedUserId = 'loggedId'
      const createdAt = new Date()

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
          createdAt,
          parentId: 'postId1',
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          author: {
            id: userId,
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        },
        {
          id: 'commentId2',
          authorId: userId,
          content: 'Comment content 2',
          images: [],
          createdAt,
          parentId: 'postId2',
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          author: {
            id: userId,
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        }
      ])

      const expected: ExtendedCommentDTO[] = [
        {
          id: 'commentId1',
          authorId: userId,
          content: 'Comment content 1',
          images: [],
          createdAt,
          parentId: 'postId1',
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          author: {
            id: userId,
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        },
        {
          id: 'commentId2',
          authorId: userId,
          content: 'Comment content 2',
          images: [],
          createdAt,
          parentId: 'postId2',
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          author: {
            id: userId,
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        }
      ]

      // when
      const result = await service.getCommentsByUser(loggedUserId, userId)

      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(userRepositoryMock.getById).toHaveBeenCalled()
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
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
        expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1)
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
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(1)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
        expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1)
        expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
      }
    })
  })

  describe('getCommentsByPost method', () => {
    it('should return an array of comments if post author has public profile', async () => {
      // given
      const postId = 'postId'
      const loggedUserId = 'loggedId'
      const createdAt = new Date()
      const options = { limit: 1, after: 'afterCursorId' }
      const author: UserViewDTO = {
        id: 'authorId',
        name: 'name',
        username: 'username',
        profilePicture: null
      }

      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        authorId: 'authorId',
        content: 'Post Content',
        images: [],
        createdAt
      })

      commentRepositoryMock.getCommentsByPost.mockResolvedValue([
        {
          id: 'commentId1',
          authorId: 'authorId',
          content: 'Comment content 1',
          images: [],
          createdAt,
          parentId: 'postId1',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        },
        {
          id: 'commentId2',
          authorId: 'authorId',
          content: 'Comment content 2',
          images: [],
          createdAt,
          parentId: 'postId2',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        }
      ])

      const expected: ExtendedCommentDTO[] = [
        {
          id: 'commentId1',
          authorId: 'authorId',
          content: 'Comment content 1',
          images: [],
          createdAt,
          parentId: 'postId1',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        },
        {
          id: 'commentId2',
          authorId: 'authorId',
          content: 'Comment content 2',
          images: [],
          createdAt,
          parentId: 'postId2',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        }
      ]

      // when
      const result = await service.getCommentsByPost(loggedUserId, postId, options)

      // then
      expect(result).toEqual(expected)
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
    })

    it('should return an array of comments if post author has private profile but logges user is following him', async () => {
      // given
      const postId = 'postId'
      const loggedUserId = 'loggedId'
      const createdAt = new Date()
      const options = { limit: 1, after: 'afterCursorId' }
      const author: UserViewDTO = {
        id: 'authorId',
        name: 'name',
        username: 'username',
        profilePicture: null
      }

      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(true)
      bucketManagerMock.getImage.mockResolvedValue('url')

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        authorId: 'authorId',
        content: 'Post Content',
        images: [],
        createdAt
      })

      commentRepositoryMock.getCommentsByPost.mockResolvedValue([
        {
          id: 'commentId1',
          authorId: 'authorId',
          content: 'Comment content 1',
          images: ['image.jpg'],
          createdAt,
          parentId: 'postId1',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        },
        {
          id: 'commentId2',
          authorId: 'authorId',
          content: 'Comment content 2',
          images: ['image.jpg'],
          createdAt,
          parentId: 'postId2',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        }
      ])

      const expected: ExtendedCommentDTO[] = [
        {
          id: 'commentId1',
          authorId: 'authorId',
          content: 'Comment content 1',
          images: ['url'],
          createdAt,
          parentId: 'postId1',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        },
        {
          id: 'commentId2',
          authorId: 'authorId',
          content: 'Comment content 2',
          images: ['url'],
          createdAt,
          parentId: 'postId2',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        }
      ]

      // when
      const result = await service.getCommentsByPost(loggedUserId, postId, options)

      // then
      expect(result).toEqual(expected)
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
    })

    it('should generate an image url every time a comment has', async () => {
      // given
      const postId = 'postId'
      const loggedUserId = 'loggedId'
      const createdAt = new Date()
      const options = { limit: 1, after: 'afterCursorId' }
      const author: UserViewDTO = {
        id: 'authorId',
        name: 'name',
        username: 'username',
        profilePicture: null
      }

      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(true)
      bucketManagerMock.getImage.mockResolvedValue('url')

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        authorId: 'authorId',
        content: 'Post Content',
        images: [],
        createdAt
      })

      commentRepositoryMock.getCommentsByPost.mockResolvedValue([
        {
          id: 'commentId1',
          authorId: 'authorId',
          content: 'Comment content 1',
          images: ['image.jpg'],
          createdAt,
          parentId: 'postId1',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        },
        {
          id: 'commentId2',
          authorId: 'authorId',
          content: 'Comment content 2',
          images: ['image.jpg'],
          createdAt,
          parentId: 'postId2',
          qtyLikes: 0,
          qtyRetweets: 0,
          qtyComments: 0,
          author
        }
      ])

      // when
      await service.getCommentsByPost(loggedUserId, postId, options)

      // then
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(2)
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
    })

    it('should throw NotFoundException if post to query comments was not found', async () => {
      // given
      const postId = 'postId'
      const loggedUserId = 'loggedId'
      const options = { limit: 1, after: 'afterCursorId' }

      postRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.getCommentsByPost(loggedUserId, postId, options)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find post" })
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(0)
        expect(postRepositoryMock.getById).toHaveBeenCalled()
      }
    })

    it('should throw ForbiddenException if author has private profile and logged user is not following him', async () => {
      // given
      const postId = 'postId'
      const loggedUserId = 'loggedId'
      const options = { limit: 1, after: 'afterCursorId' }

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        authorId: 'authorId',
        content: 'Post Content',
        images: [],
        createdAt: new Date()
      })

      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(false)

      try {
        // when
        await service.getCommentsByPost(loggedUserId, postId, options)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ForbiddenException)
        expect(e).toMatchObject({ message: 'Forbidden. You are not allowed to perform this action' })
        expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
        expect(postRepositoryMock.getById).toHaveBeenCalled()
      }
    })
  })
})
