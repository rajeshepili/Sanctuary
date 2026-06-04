import { createServerFn } from '@tanstack/react-start'
import { getMediaSchema, uploadMediaSchema } from './media.schema'
import { saveMediaService, getMediaService } from './media.service'

export const uploadMedia = createServerFn({ method: 'POST' })
  .inputValidator(uploadMediaSchema)
  .handler(async ({ data }) => saveMediaService(data))

export const getMedia = createServerFn({ method: 'GET' })
  .inputValidator(getMediaSchema)
  .handler(async ({ data }) =>
    getMediaService(data.mediaId, data.thumbnailOnly),
  )
