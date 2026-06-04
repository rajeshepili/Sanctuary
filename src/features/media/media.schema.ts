import z from 'zod'

export const uploadMediaSchema = z.object({
  entryId: z.number(),
  base64Data: z.string(),
})

export const getMediaSchema = z.object({
  mediaId: z.number(),
  thumbnailOnly: z.boolean().optional().default(false),
})
