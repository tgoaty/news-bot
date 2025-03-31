import { Composer, InlineKeyboard } from "../deps.ts";

const inlineKeyboardEn = new InlineKeyboard()
	.text("Business", "add_business")
	.row().text("Entertainment", "add_entertainment")
	.row().text("General", "add_general")
	.row().text("Health", "add_health")
	.row().text("Science", "add_science")
	.row().text("Sports", "add_sports")
	.row().text("Technology", "add_technology");

// const inlineKeyboardRu = new InlineKeyboard()
// 	.text("Бизнес", "add_business")
// 	.row().text("Развлечения", "add_entertainment")
// 	.row().text("Главное", "add_general")
// 	.row().text("Здоровье", "add_health")
// 	.row().text("Наука", "add_science")
// 	.row().text("Спорт", "add_sports")
// 	.row().text("Технологии", "add_technology");

export function categoriesSelection() {
	const composer = new Composer();
	composer.command("categoriesSelection", async (ctx, next) => {
		await ctx.reply("categories:", { reply_markup: inlineKeyboardEn });
		await next();
	});
	return composer;
}
