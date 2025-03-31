import { Composer } from "../deps.ts";

export function startCommand() {
	const composer = new Composer();
	composer.command("start", async (ctx, next) => {
		await ctx.reply("Привет! Это бот для рассылки новостей, для начала давай его настроим >> /language_selection");
		await next();
	});
	return composer;
}
