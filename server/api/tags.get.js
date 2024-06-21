import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default defineEventHandler(() => {
  const directoryPath = path.join('content/blogs');

  function getTagsFromMdFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: metaData } = matter(raw);
    return metaData.tags || [];
  }

  function getTagsCount(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const tagCounts = {};

    entries.forEach((entry) => {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const tags = getTagsFromMdFile(path.join(dirPath, entry.name));
        tags.forEach(tag => {
          if (tagCounts[tag]) {
            tagCounts[tag] += 1;
          } else {
            tagCounts[tag] = 1;
          }
        });
      }
    });

    return tagCounts;
  }

  const tagCounts = {};
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      const dirPath = path.join(directoryPath, entry.name);
      const directoryTagCounts = getTagsCount(dirPath);
      for (const tag in directoryTagCounts) {
        if (tagCounts[tag]) {
          tagCounts[tag] += directoryTagCounts[tag];
        } else {
          tagCounts[tag] = directoryTagCounts[tag];
        }
      }
    }
  });

  return tagCounts;
});
