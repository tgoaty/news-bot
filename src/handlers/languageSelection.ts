import { Composer, InlineKeyboard } from "../deps.ts";

const inlineKeyboard = new InlineKeyboard().text("en", "lang_en").text("ru", "lang_ru");

export function languageSelection() {
	const composer = new Composer();
	composer.command("language_selection", async (ctx, next) => {
		await ctx.reply("Выберите язык новостей:", { reply_markup: inlineKeyboard });
		await next();
	});
	return composer;
}
