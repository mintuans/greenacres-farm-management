import Parser from 'rss-parser';

const parser = new Parser();

export interface ExternalNewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
    contentSnippet: string;
    thumbnail?: string;
    source: string;
}

/**
 * Fetch latest news from VNExpress RSS
 */
export const getLatestNews = async (): Promise<ExternalNewsItem[]> => {
    try {
        const feed = await parser.parseURL('https://vnexpress.net/rss/tin-moi-nhat.rss');

        return feed.items.map((item: any) => {
            // VNExpress RSS encodes thumbnail in the description HTML
            // Example: <a href="..."><img src="thumb_url" ></a>Description text
            const description = item.content || item.description || '';
            const imgMatch = description.match(/src="([^"]+)"/);
            const thumbnail = imgMatch ? imgMatch[1] : undefined;

            // Clean up the description to get only the text
            const contentSnippet = description.replace(/<[^>]*>/g, '').trim();

            return {
                id: item.guid || item.link,
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                content: item.content || item.description,
                contentSnippet: contentSnippet,
                thumbnail: thumbnail,
                source: 'VNExpress'
            };
        });
    } catch (error) {
        console.error('Error fetching news from VNExpress:', error);
        return [];
    }
};
