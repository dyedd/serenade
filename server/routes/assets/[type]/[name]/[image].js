import fs from 'fs-extra'
import { resolve } from 'path'

const resolveMimeType = (filename) => {
  const extension = filename.split('.').pop()

  if (typeof extension === 'string') {
    const mimeTypes = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp'
    }

    return mimeTypes[extension] ?? 'application/octet-stream'
  } else {
    return 'application/octet-stream'
  }
}

export default defineEventHandler(async (event) => {
  const { type, name, image } = event.context.params
  const contentDir = type === 'columns' ? 'columns' : 'posts'
  const imagePath = resolve(`./content/${contentDir}/${name}/${image}`)

  try {
    const imageData = await fs.readFile(imagePath)
    const mimeType = resolveMimeType(image)

    event.node.res.setHeader('Content-Type', mimeType)
    return imageData
  } catch (error) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
})
