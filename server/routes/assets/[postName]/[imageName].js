import fs from 'fs-extra'
import { resolve } from 'path';
export default defineEventHandler(async (event) => {
    const { postName, imageName } = event.context.params;
    const imagePath = resolve(`./content/posts/${postName}/${imageName}`);
    try {
        const image = await fs.readFile(imagePath);
        const extension = imageName.split('.').pop();
        const mimeTypes = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml'
        };
        const mimeType = mimeTypes[extension] || 'application/octet-stream';

        event.node.res.setHeader('Content-Type', mimeType);
        return image;
    } catch (error) {
        throw createError({ statusCode: 404, statusMessage: 'Image not found' });
    }
});
