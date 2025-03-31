import { Composer } from "../deps.ts";

export function startCommand() {
	const composer = new Composer();
	composer.command("start", async (ctx, next) => {
		await ctx.reply("Hello world!");
		await next();
	});
	return composer;
}
