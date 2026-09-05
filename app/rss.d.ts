declare module 'rss' {
  interface FeedItemOptions {
    title: string;
    description?: string;
    url?: string;
    guid?: string;
    categories?: string[];
    author?: string;
    date?: string | Date;
    enclosure?: { url: string; type?: string; length?: number };
    [key: string]: unknown;
  }

  interface FeedOptions {
    title: string;
    description: string;
    feed_url?: string;
    site_url?: string;
    language?: string;
    copyright?: string;
    managingEditor?: string;
    webMaster?: string;
    pubDate?: string | Date;
    ttl?: number;
    [key: string]: unknown;
  }

  class Feed {
    constructor(options: FeedOptions);
    item(options: FeedItemOptions): this;
    xml(options?: { indent?: boolean }): string;
  }

  export default Feed;
}
