import { S3 } from '@aws-sdk/client-s3'
import { Constants } from './constants'

export const s3 = new S3({
  region: Constants.S3_REGION,
  credentials: {
    accessKeyId: Constants.AWS_ACCESS_KEY_ID,
    secretAccessKey: Constants.AWS_SECRET_ACCESS_KEY
  }
})
