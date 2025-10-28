import fs from 'fs-extra'
import { resolve } from 'path';

export default defineEventHandler(async (event) => {
    const { type, name, image } = event.context.params;

    // 根据 type 确定内容目录
    const contentDir = type === 'columns' ? 'columns' : 'posts';
    const imagePath = resolve(`./content/${contentDir}/${name}/${image}`);

    try {
        const imageData = await fs.readFile(imagePath);
        const extension = image.split('.').pop();
        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp'
        };
        const mimeType = mimeTypes[extension] || 'application/octet-stream';

        event.node.res.setHeader('Content-Type', mimeType);
        return imageData;
    } catch (error) {
        throw createError({ statusCode: 404, statusMessage: 'Image not found' });
    }
});
