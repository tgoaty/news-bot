import { PrismaClient } from "../generated/client/deno/edge.ts";

const prisma = new PrismaClient();

export class PrismaApi {
    static async createOrUpdateUser(tgId: number, language: string, frequency: number = 2) {
        return await prisma.user.upsert({
            where: { tgID: BigInt(tgId) },
            update: { 
                lang: language,
                frequency: frequency
            },
            create: { 
                tgID: BigInt(tgId), 
                lang: language,
                frequency: frequency
            }
        });
    }

    static async updateUserFrequency(tgId: number, frequency: number) {
        return await prisma.user.update({
            where: { tgID: BigInt(tgId) },
            data: { frequency: frequency }
        });
    }

    static async getUserFrequency(tgId: number): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { tgID: BigInt(tgId) }
        });
        return user?.frequency || 2;
    }

    static async updateUserCategories(tgId: number, categories: string[]) {
        // First, get or create categories
        const categoryPromises = categories.map(category => 
            prisma.category.upsert({
                where: { name: category },
                update: {},
                create: { name: category }
            })
        );
        const createdCategories = await Promise.all(categoryPromises);

        // Get the user
        const user = await prisma.user.findUnique({
            where: { tgID: BigInt(tgId) }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Update user's categories
        await prisma.user.update({
            where: { id: user.id },
            data: {
                categories: {
                    set: createdCategories.map(cat => ({ id: cat.id }))
                }
            }
        });
    }

    static async getUserCategories(tgId: number) {
        const user = await prisma.user.findUnique({
            where: { tgID: BigInt(tgId) },
            include: { categories: true }
        });

        return user?.categories.map(cat => cat.name) || [];
    }

    static async getUserLanguage(tgId: number) {
        const user = await prisma.user.findUnique({
            where: { tgID: BigInt(tgId) }
        });

        return user?.lang || "en";
    }

    static async getAllUsers() {
        return await prisma.user.findMany({
            include: {
                categories: true
            }
        });
    }
}
