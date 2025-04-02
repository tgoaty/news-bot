import { InlineKeyboard, Context } from "../deps.ts";
import { type Conversation } from "https://esm.sh/@grammyjs/conversations@2.0.1";
import { PrismaApi } from "../prisma-api/PrismaApi.ts";

const GENRES = ["business", "entertainment", "general", "health", "science", "sports", "technology"];
const FREQUENCIES = [2, 3, 4, 5, 6];
const LANGUAGES = ["en", "ru"];

function calculateNextDeliveryTime(frequency: number): string {
	const now = new Date();
	const currentHour = now.getHours();
	const startHour = 8; // 8:00
	const endHour = 22; // 22:00

	// If current time is before 8:00, next delivery is at 8:00
	if (currentHour < startHour) {
		return `08:00`;
	}

	// If current time is after 22:00, next delivery is tomorrow at 8:00
	if (currentHour >= endHour) {
		return `завтра в 08:00`;
	}

	const totalHours = endHour - startHour;
	const interval = Math.floor(totalHours / frequency);
	
	// Find the next delivery time
	for (let i = 0; i < frequency; i++) {
		const deliveryHour = startHour + (i * interval);
		if (deliveryHour > currentHour) {
			return `${deliveryHour.toString().padStart(2, '0')}:00`;
		}
	}

	// If no more deliveries today, next is tomorrow at 8:00
	return `завтра в 08:00`;
}

export async function settings(conversation: Conversation, ctx: Context) {
	if (!ctx.from?.id) {
		await ctx.reply("❌ Ошибка: не удалось получить ID пользователя");
		return;
	}

	// Language selection
	await ctx.reply("🌐 Выберите язык новостей:", {
		reply_markup: new InlineKeyboard(
			LANGUAGES.map((lang) => [
				{ text: lang === "en" ? "🇬🇧 English" : "🇷🇺 Русский", callback_data: lang },
			]),
		),
	});

	const { callbackQuery: langQuery } = await conversation.waitFor("callback_query:data");
	const selectedLanguage = langQuery.data;

	// Save language to database
	await PrismaApi.createOrUpdateUser(ctx.from.id, selectedLanguage);

	// Categories selection
	await ctx.reply("📰 Выберите рубрики новостей:", {
		reply_markup: new InlineKeyboard(
			GENRES.map((genre) => [
				{ text: genre, callback_data: genre },
			]).concat([[{ text: "✅ Готово", callback_data: "done" }]]),
		),
	});

	let selectedGenres: string[] = [];
	while (true) {
		const { callbackQuery } = await conversation.waitFor("callback_query:data");
		const genre = callbackQuery.data;

		if (genre === "done") {
			if (selectedGenres.length === 0) {
				await ctx.reply("❌ Пожалуйста, выберите хотя бы одну категорию");
				continue;
			}
			break;
		}

		if (selectedGenres.includes(genre)) {
			selectedGenres = selectedGenres.filter((g) => g !== genre);
		} else {
			selectedGenres.push(genre);
		}

		await ctx.editMessageText("📰 Выберите категории:", {
			reply_markup: new InlineKeyboard(
				GENRES.map((genre) => [
					{
						text: selectedGenres.includes(genre) ? `✅ ${genre}` : genre,
						callback_data: genre,
					},
				]).concat([[{ text: "✅ Готово", callback_data: "done" }]]),
			),
		});
	}

	// Save categories to database
	await PrismaApi.updateUserCategories(ctx.from.id, selectedGenres);

	// Frequency selection
	await ctx.reply("⏰ Сколько раз в день присылать уведомления?", {
		reply_markup: new InlineKeyboard(
			FREQUENCIES.map((freq) => [
				{ text: `${freq} раза в день`, callback_data: freq.toString() },
			]),
		),
	});

	const { callbackQuery: freqQuery } = await conversation.waitFor("callback_query:data");
	const frequency = parseInt(freqQuery.data);

	// Save frequency to database
	await PrismaApi.updateUserFrequency(ctx.from.id, frequency);

	// Calculate next delivery time
	const nextDeliveryTime = calculateNextDeliveryTime(frequency);

	// Summary with next delivery time
	await ctx.reply(
		`✨ Настройка завершена!\n\n` +
		`🌐 Язык: ${selectedLanguage === "en" ? "🇬🇧 English" : "🇷🇺 Русский"}\n` +
		`📰 Категории: ${selectedGenres.join(", ")}\n` +
		`⏰ Уведомления: ${frequency} раза в день\n\n` +
		`📬 Первая новость придет ${nextDeliveryTime}`,
	);
}
