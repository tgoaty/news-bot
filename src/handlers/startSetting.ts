import { Composer, InlineKeyboard } from "../deps.ts";

const inlineKeyboard = new InlineKeyboard().text("Начать");

export function startSetting() {
	const composer = new Composer();
	composer.command("settings", async (ctx, next) => {
		await ctx.reply("Приступим к настройке!", { reply_markup: inlineKeyboard });
		await next();
	});
	return composer;
}
