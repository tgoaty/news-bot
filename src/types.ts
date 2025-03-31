interface ArticleSource {
    id: string | null;
    name: string;
}

interface Article {
    source: ArticleSource;
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

export interface NewsApiResponse {
    status: "ok" | "error";
    totalResults: number;
    articles: Article[];
}