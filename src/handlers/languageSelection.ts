import { Composer, InlineKeyboard } from "../deps.ts";

const inlineKeyboard = new InlineKeyboard().text("en", "lang_en").text("ru", "lang_ru");

export function languageSelection() {
	const composer = new Composer();
	composer.command("languageSelection", async (ctx, next) => {
		await ctx.reply("languageSelection:", { reply_markup: inlineKeyboard });
		await next();
	});
	return composer;
}
