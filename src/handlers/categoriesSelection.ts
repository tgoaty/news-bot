import { Composer, InlineKeyboard } from "../deps.ts";

const inlineKeyboard = new InlineKeyboard()
	.text("Бизнес", "add_business")
	.row().text("Развлечения", "add_entertainment")
	.row().text("Главное", "add_general")
	.row().text("Здоровье", "add_health")
	.row().text("Наука", "add_science")
	.row().text("Спорт", "add_sports")
	.row().text("Технологии", "add_technology")
	.row().text("Готово");

export function categoriesSelection() {
	const composer = new Composer();
	composer.command("categories_selection", async (ctx, next) => {
		await ctx.reply("categories:", { reply_markup: inlineKeyboard });
		await next();
	});
	return composer;
}
