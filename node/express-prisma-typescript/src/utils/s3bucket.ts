import { GetObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { Constants } from './constants'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export class BucketManager {
  constructor (private readonly s3: S3) {}

  async putImage (key: string): Promise<string> {
    const putCommand = new PutObjectCommand({
      Bucket: Constants.S3_BUCKET,
      Key: key,
      ContentType: 'image/*'
    })

    return await getSignedUrl(this.s3, putCommand, { expiresIn: 3600 })
  }

  async getImage (key: string): Promise<string> {
    const getCommand = new GetObjectCommand({
      Bucket: Constants.S3_BUCKET,
      Key: key
    })

    return await getSignedUrl(this.s3, getCommand, { expiresIn: 3600 })
  }
}
