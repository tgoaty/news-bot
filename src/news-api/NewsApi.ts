import "jsr:@std/dotenv/load";
import { NewsApiResponse } from "../types.ts";

export class NewsApi {
	static url = "https://newsapi.org";
	static key = Deno.env.get("NEWS_API_KEY");

	static async getData(options: { [key: string]: string }) {
		if (!this.key) {
			throw new Error("No key provided");
		}
		options["apiKey"] = this.key;

		const params = new URLSearchParams(options);
		const url = `${this.url}/v2/top-headlines?${params}`;

		const response = await fetch(url);

		return await response.json() as Promise<NewsApiResponse>;
	}
}
