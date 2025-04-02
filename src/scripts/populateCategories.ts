import { PrismaClient } from "../generated/client/deno/edge.ts";

const prisma = new PrismaClient();

const categories = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology"
];

async function main() {
    console.log("🌱 Начинаем заполнение категорий...");

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category },
            update: {},
            create: { name: category }
        });
        console.log(`✅ Добавлена категория: ${category}`);
    }

    console.log("✨ Заполнение категорий завершено!");
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error("❌ Ошибка при заполнении категорий:", e);
    prisma.$disconnect();
    Deno.exit(1);
}); 