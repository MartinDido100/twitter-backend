import { FollowRepositoryImpl } from '@domains/follow'
import { UserRepositoryImpl } from '@domains/user/repository'
import { BucketManager } from '@utils/s3bucket'
import { mock } from 'jest-mock-extended'

export const userRepositoryMock = mock<UserRepositoryImpl>()

export const followRepositoryMock = mock<FollowRepositoryImpl>()

export const bucketManagerMock = mock<BucketManager>()
