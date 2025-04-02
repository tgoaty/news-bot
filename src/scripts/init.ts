import "jsr:@std/dotenv/load";
import { PrismaClient } from "../generated/client/deno/edge.ts";

const prisma = new PrismaClient();

async function checkEnvironment() {
    console.log("🔍 Проверка окружения...");

    const requiredEnvVars = [
        "BOT_TOKEN",
        "NEWS_API_KEY",
        "DATABASE_URL"
    ];

    let allVarsPresent = true;
    for (const envVar of requiredEnvVars) {
        if (!Deno.env.get(envVar)) {
            console.error(`❌ Отсутствует переменная окружения: ${envVar}`);
            allVarsPresent = false;
        }
    }

    if (!allVarsPresent) {
        console.error("❌ Пожалуйста, установите все необходимые переменные окружения");
        Deno.exit(1);
    }

    console.log("✅ Все переменные окружения установлены");
}

async function checkDatabase() {
    console.log("\n🔍 Проверка базы данных...");

    try {
        // Проверка подключения к базе данных
        await prisma.$connect();
        console.log("✅ Подключение к базе данных успешно");

        // Проверка наличия категорий
        const categories = await prisma.category.findMany();
        if (categories.length === 0) {
            console.log("⚠️ Таблица категорий пуста, заполняем...");
            await populateCategories();
        } else {
            console.log(`✅ В базе данных ${categories.length} категорий`);
        }

    } catch (error) {
        console.error("❌ Ошибка при работе с базой данных:", error);
        Deno.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

async function populateCategories() {
    const categories = [
        "business",
        "entertainment",
        "general",
        "health",
        "science",
        "sports",
        "technology"
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category },
            update: {},
            create: { name: category }
        });
        console.log(`✅ Добавлена категория: ${category}`);
    }
}

async function main() {
    console.log("🚀 Инициализация бота...\n");

    await checkEnvironment();
    await checkDatabase();

    console.log("\n✨ Инициализация завершена успешно!");
    console.log("📝 Для запуска бота выполните: deno task dev");
}

main().catch((error) => {
    console.error("❌ Ошибка при инициализации:", error);
    Deno.exit(1);
}); 