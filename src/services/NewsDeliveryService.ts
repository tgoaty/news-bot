import { Bot } from "../deps.ts";
import { PrismaApi } from "../prisma-api/PrismaApi.ts";
import { NewsApi } from "../news-api/NewsApi.ts";

export class NewsDeliveryService {
    private bot: Bot;
    private static instance: NewsDeliveryService;
    private lastDeliveredNews: Map<string, Set<string>> = new Map(); // category -> set of article URLs

    private constructor(bot: Bot) {
        this.bot = bot;
    }

    static getInstance(bot: Bot): NewsDeliveryService {
        if (!NewsDeliveryService.instance) {
            NewsDeliveryService.instance = new NewsDeliveryService(bot);
        }
        return NewsDeliveryService.instance;
    }

    private calculateDeliveryTimes(frequency: number): number[] {
        const startHour = 8; // 8:00
        const endHour = 22; // 22:00
        const totalHours = endHour - startHour;
        const interval = Math.floor(totalHours / frequency);
        
        const times: number[] = [];
        for (let i = 0; i < frequency; i++) {
            const hour = startHour + (i * interval);
            times.push(hour);
        }
        return times;
    }

    private async isTimeToDeliver(userId: number, currentHour: number): Promise<boolean> {
        const frequency = await PrismaApi.getUserFrequency(userId);
        const deliveryTimes = this.calculateDeliveryTimes(frequency);
        return deliveryTimes.includes(currentHour);
    }

    private isNewsAlreadyDelivered(category: string, url: string): boolean {
        if (!this.lastDeliveredNews.has(category)) {
            this.lastDeliveredNews.set(category, new Set());
        }
        const deliveredUrls = this.lastDeliveredNews.get(category)!;
        return deliveredUrls.has(url);
    }

    private markNewsAsDelivered(category: string, url: string) {
        if (!this.lastDeliveredNews.has(category)) {
            this.lastDeliveredNews.set(category, new Set());
        }
        this.lastDeliveredNews.get(category)!.add(url);
    }

    private clearOldDeliveredNews() {
        // Clear the cache every 24 hours to prevent memory growth
        this.lastDeliveredNews.clear();
    }

    async deliverNews() {
        try {
            const now = new Date();
            const currentHour = now.getHours();

            // Check if current hour is within delivery hours (8-22)
            if (currentHour < 8 || currentHour > 22) {
                return;
            }

            // Clear old delivered news at midnight
            if (currentHour === 0) {
                this.clearOldDeliveredNews();
            }

            // Get all users and their preferences
            const users = await PrismaApi.getAllUsers();
            
            for (const user of users) {
                try {
                    if (!await this.isTimeToDeliver(Number(user.tgID), currentHour)) {
                        continue;
                    }

                    const categories = await PrismaApi.getUserCategories(Number(user.tgID));
                    const language = await PrismaApi.getUserLanguage(Number(user.tgID));

                    for (const category of categories) {
                        try {
                            const news = await NewsApi.getData({
                                category: category,
                                language: language,
                                pageSize: "5"
                            });

                            if (news.articles.length > 0) {
                                const article = news.articles[0];
                                
                                // Skip if this news was already delivered
                                if (this.isNewsAlreadyDelivered(category, article.url)) {
                                    continue;
                                }

                                const message = this.formatNewsMessage(article, category);
                                await this.bot.api.sendMessage(Number(user.tgID), message, {
                                    parse_mode: "HTML"
                                });

                                this.markNewsAsDelivered(category, article.url);
                            }
                        } catch (error) {
                            console.error(`Error delivering news for category ${category} to user ${user.tgID}:`, error);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing user ${user.tgID}:`, error);
                }
            }
        } catch (error) {
            console.error("Error in deliverNews:", error);
        }
    }

    private formatNewsMessage(article: any, category: string): string {
        return `<b>📰 ${category.charAt(0).toUpperCase() + category.slice(1)} News</b>\n\n` +
               `<b>${article.title}</b>\n\n` +
               `${article.description || ''}\n\n` +
               `<a href="${article.url}">Read more</a>`;
    }

    startScheduler() {
        // Check every 5 minutes to be more precise with delivery times
        setInterval(() => this.deliverNews(), 5 * 60 * 1000);
        // Initial check
        this.deliverNews();
    }
} 