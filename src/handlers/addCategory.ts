import { Composer } from "../deps.ts";

export function addCategory() {
    const composer = new Composer();

    composer.callbackQuery(/^add_[a-zA-Z]+$/, async (ctx, next) => {
        const category = ctx.match[1];
        const userID = ctx.from.id;

        await ctx.reply(`Добавлена категория: ${category}`);
        await next();
    })
}