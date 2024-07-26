import { PostService, PostServiceImpl } from '@domains/post/service'
import { bucketManagerMock, followRepositoryMock, postRepositoryMock, userRepositoryMock } from '../mock'
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '@domains/post/dto'
import { ForbiddenException, NotFoundException } from '@utils'

describe('Post service tests', () => {
  let service: PostService

  beforeEach(() => {
    service = new PostServiceImpl(postRepositoryMock, followRepositoryMock, userRepositoryMock, bucketManagerMock)
    jest.resetAllMocks()
  })

  describe('createPost method', () => {
    it('should return a new post with no images urls', async () => {
      // given
      const loggedUser = 'loggedId'
      const createdAt = new Date()
      const input: CreatePostInputDTO = {
        content: 'Post Content',
        images: []
      }

      postRepositoryMock.create.mockResolvedValue({
        id: 'postId',
        authorId: loggedUser,
        content: input.content,
        images: input.images as string[],
        createdAt
      })

      const expected: PostDTO = {
        id: 'postId',
        authorId: loggedUser,
        content: input.content,
        images: [],
        createdAt
      }

      // when
      const result = await service.createPost(loggedUser, input)

      // then
      expect(result).toEqual(expected)
      expect(postRepositoryMock.create).toHaveBeenCalled()
      expect(bucketManagerMock.putImage).toHaveBeenCalledTimes(0)
    })

    it('should return a new post with images urls', async () => {
      // given
      const loggedUser = 'loggedId'
      const createdAt = new Date()
      const input: CreatePostInputDTO = {
        content: 'Post Content',
        images: ['image1.jpg', 'image2.jpg']
      }

      postRepositoryMock.create.mockResolvedValue({
        id: 'postId',
        authorId: loggedUser,
        content: input.content,
        images: input.images as string[],
        createdAt
      })

      bucketManagerMock.putImage.mockResolvedValue('url')

      const expected: PostDTO = {
        id: 'postId',
        authorId: loggedUser,
        content: input.content,
        images: ['url', 'url'],
        createdAt
      }

      // when
      const result = await service.createPost(loggedUser, input)

      // then
      expect(result).toEqual(expected)
      expect(postRepositoryMock.create).toHaveBeenCalled()
      expect(bucketManagerMock.putImage).toHaveBeenCalledTimes(expected.images.length)
    })
  })

  describe('deletePost method', () => {
    it('should delete a post', async () => {
      // given
      const loggedUserId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        authorId: loggedUserId,
        images: [],
        content: 'Content',
        createdAt: new Date()
      })

      // when
      await service.deletePost(loggedUserId, postId)

      // then
      expect(postRepositoryMock.delete).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
    })

    it('should throw NotFoundException if post given was not found', async () => {
      // given
      const loggedUserId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.deletePost(loggedUserId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find post" })
        expect(postRepositoryMock.getById).toHaveBeenCalled()
      }
    })

    it('should throw ForbiddenException if post author is different to logged user', async () => {
      // given
      const loggedUserId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        authorId: 'differentAuthorId',
        images: [],
        content: 'Content',
        createdAt: new Date()
      })

      try {
        // when
        await service.deletePost(loggedUserId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ForbiddenException)
        expect(e).toMatchObject({ message: 'Forbidden. You are not allowed to perform this action' })
        expect(postRepositoryMock.getById).toHaveBeenCalled()
      }
    })
  })

  describe('getPost method', () => {
    it('should return a post if author has public profile', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'
      const createdAt = new Date()

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        authorId: 'authorId',
        images: [],
        content: 'Content',
        createdAt
      })

      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

      const expected: PostDTO = {
        id: postId,
        authorId: 'authorId',
        images: [],
        content: 'Content',
        createdAt
      }

      // when
      const result = await service.getPost(loggedId, postId)

      // then
      expect(result).toEqual(expected)
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
    })

    it('should return a post if author has private profile but logged user is following him', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'
      const createdAt = new Date()

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        authorId: 'authorId',
        images: [],
        content: 'Content',
        createdAt
      })

      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(true)

      const expected: PostDTO = {
        id: postId,
        authorId: 'authorId',
        images: [],
        content: 'Content',
        createdAt
      }

      // when
      const result = await service.getPost(loggedId, postId)

      // then
      expect(result).toEqual(expected)
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
    })

    it('should generate as urls as post images has', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'
      const createdAt = new Date()
      const images = ['image1.jpg', 'image2.jpg']

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        authorId: 'authorId',
        images,
        content: 'Content',
        createdAt
      })

      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(true)
      bucketManagerMock.getImage.mockResolvedValue('url')

      // when
      await service.getPost(loggedId, postId)

      // then
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(images.length)
    })

    it('should throw NotFounException if given post was not found', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.getPost(loggedId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find post" })
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(0)
        expect(postRepositoryMock.getById).toHaveBeenCalled()
        expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
      }
    })

    it('should throw ForbiddenException if author has private profile and logged user is not following him', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      followRepositoryMock.checkFollow.mockResolvedValue(false)
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)

      postRepositoryMock.getById.mockResolvedValue({
        id: postId,
        authorId: 'authorId',
        images: [],
        content: 'Content',
        createdAt: new Date()
      })

      try {
        // when
        await service.getPost(loggedId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ForbiddenException)
        expect(e).toMatchObject({ message: 'Forbidden. You are not allowed to perform this action' })
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(1)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
        expect(postRepositoryMock.getById).toHaveBeenCalled()
        expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
      }
    })
  })

  describe('getLatestsPosts method', () => {
    it('should return an array of posts', async () => {
      // given
      const loggedId = 'loggedId'
      const options = { limit: 5, after: 'afterCursorId' }
      const createdAt = new Date()

      postRepositoryMock.getAllByDatePaginated.mockResolvedValue([
        {
          id: 'postId',
          authorId: 'authorId',
          content: 'Post content',
          images: [],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: 'authorId',
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        },
        {
          id: 'postId2',
          authorId: 'authorId2',
          content: 'Post content2',
          images: [],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: 'authorId2',
            name: 'name2',
            username: 'username2',
            profilePicture: null
          }
        }
      ])

      const expected = [
        {
          id: 'postId',
          authorId: 'authorId',
          content: 'Post content',
          images: [],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: 'authorId',
            name: 'name',
            username: 'username',
            profilePicture: null
          }
        },
        {
          id: 'postId2',
          authorId: 'authorId2',
          content: 'Post content2',
          images: [],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: 'authorId2',
            name: 'name2',
            username: 'username2',
            profilePicture: null
          }
        }
      ]

      // when
      const result = await service.getLatestPosts(loggedId, options)

      // then
      expect(result).toEqual(expected)
      expect(result.length).toBe(expected.length)
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
      expect(postRepositoryMock.getAllByDatePaginated).toHaveBeenCalled()
    })

    it('should generate an image url every time that a post has images or author has profile picture', async () => {
      // given
      const loggedId = 'loggedId'
      const options = { limit: 5, after: 'afterCursorId' }
      const createdAt = new Date()

      bucketManagerMock.getImage.mockResolvedValue('url')

      postRepositoryMock.getAllByDatePaginated.mockResolvedValue([
        {
          id: 'postId',
          authorId: 'authorId',
          content: 'Post content',
          images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: 'authorId',
            name: 'name',
            username: 'username',
            profilePicture: 'profilePic1.jpg'
          }
        },
        {
          id: 'postId2',
          authorId: 'authorId2',
          content: 'Post content2',
          images: ['image1.jpg'],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: 'authorId2',
            name: 'name2',
            username: 'username2',
            profilePicture: null
          }
        }
      ])

      // when
      await service.getLatestPosts(loggedId, options)

      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(5)
      expect(postRepositoryMock.getAllByDatePaginated).toHaveBeenCalled()
    })

    it('should return an empty array', async () => {
      // given
      const loggedId = 'loggedId'
      const options = { limit: 5, after: 'afterCursorId' }

      postRepositoryMock.getAllByDatePaginated.mockResolvedValue([])

      // when
      const result = await service.getLatestPosts(loggedId, options)

      // then
      expect(result).toEqual([])
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
      expect(postRepositoryMock.getAllByDatePaginated).toHaveBeenCalled()
    })
  })

  describe('getPostsByAuthor method', () => {
    it('should return an array of posts by given author', async () => {
      // given
      const loggedId = 'loggedId'
      const authorId = 'authorId'
      const createdAt = new Date()

      userRepositoryMock.isPrivateUser.mockResolvedValue(false)
      bucketManagerMock.getImage.mockResolvedValue('url')

      postRepositoryMock.getByAuthorId.mockResolvedValue([
        {
          id: 'postId',
          authorId,
          content: 'Post content',
          images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: authorId,
            name: 'name',
            username: 'username',
            profilePicture: 'profilePic1.jpg'
          }
        },
        {
          id: 'postId2',
          authorId,
          content: 'Post content2',
          images: ['image1.jpg'],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: authorId,
            name: 'name',
            username: 'username',
            profilePicture: 'profilePic1.jpg'
          }
        }
      ])

      const expected: ExtendedPostDTO[] = [
        {
          id: 'postId',
          authorId,
          content: 'Post content',
          images: ['url', 'url', 'url'],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: authorId,
            name: 'name',
            username: 'username',
            profilePicture: 'url'
          }
        },
        {
          id: 'postId2',
          authorId,
          content: 'Post content2',
          images: ['url'],
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0,
          createdAt,
          author: {
            id: authorId,
            name: 'name',
            username: 'username',
            profilePicture: 'url'
          }
        }
      ]

      // when
      const result = await service.getPostsByAuthor(loggedId, authorId)

      // then
      expect(result).toEqual(expected)
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(6)
      expect(postRepositoryMock.getByAuthorId).toHaveBeenCalled()
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
    })

    it('should return an empty array', async () => {
      // given
      const loggedId = 'loggedId'
      const authorId = 'authorId'

      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

      postRepositoryMock.getByAuthorId.mockResolvedValue([])

      // when
      const result = await service.getPostsByAuthor(loggedId, authorId)

      // then
      expect(result).toEqual([])
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
      expect(postRepositoryMock.getByAuthorId).toHaveBeenCalled()
    })

    it('should throw ForbiddenException if author has private profile and logged user is not following him', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(false)

      try {
        // when
        await service.getPostsByAuthor(loggedId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ForbiddenException)
        expect(e).toMatchObject({ message: 'Forbidden. You are not allowed to perform this action' })
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(1)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
        expect(postRepositoryMock.getByAuthorId).toHaveBeenCalledTimes(0)
        expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
      }
    })
  })
})
