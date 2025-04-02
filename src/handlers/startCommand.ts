import { Composer } from "../deps.ts";

export function startCommand() {
	const composer = new Composer();
	composer.command("start", async (ctx, next) => {
		await ctx.reply(
			"👋 Привет! Я бот для рассылки новостей.\n\n" +
			"Используйте команду /settings чтобы настроить:\n" +
			"🌐 Язык новостей\n" +
			"📰 Категории\n" +
			"⏰ Частоту уведомлений"
		);
		await next();
	});
	return composer;
}
