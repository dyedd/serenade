export default defineEventHandler(() => {
    const items = [
        { id: 1, title: '玄学智障', description: '这里分享我们招的AI与并行计算内容', type: '企业公开', image: 'https://s3-imfile.feishucdn.com/static-resource/v1/v2_5580d23d-b9d3-4b46-b0b7-5a618507ac1g~?image_size=noop&cut_type=&quality=&format=image&sticker_format=.webp' },
        { id: 2, title: 'PAC 2024', description: 'winograd在kunpeng920上优化', type: '企业公开', image: 'https://s3-imfile.feishucdn.com/static-resource/v1/v2_cd7a8a2a-e632-40cf-b255-a67024740cbg~?image_size=noop&cut_type=&quality=&format=image&sticker_format=.webp' },
        { id: 3, title: '科研攻略', description: '打算这里放一些常用操作和环境配置攻略', type: '企业公开', image: 'https://s3-imfile.feishucdn.com/static-resource/v1/v2_02c06978-1a74-413a-a94c-961397ed116g~?image_size=noop&cut_type=&quality=&format=image&sticker_format=.webp' },
        { id: 4, title: '光和基金', description: 'distrifusion复现', type: '互联网公开', image: 'https://s1-imfile.feishucdn.com/static-resource/v1/v2_4e7bedd6-d90c-41ca-88b5-eb6334d247dg~?image_size=noop&cut_type=&quality=&format=image&sticker_format=.webp' },
        // 添加更多项目
    ];

    return [...items];
});
