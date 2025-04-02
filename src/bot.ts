import { Bot, Context } from "./deps.ts";
import "jsr:@std/dotenv/load";
import { startCommand } from "./handlers/startCommand.ts";
import { settings } from "./handlers/startSetting.ts";
import { ConversationFlavor, conversations, createConversation } from "https://esm.sh/@grammyjs/conversations@2.0.1/out/mod.d.ts";
import { NewsDeliveryService } from "./services/NewsDeliveryService.ts";

const TOKEN = Deno.env.get("BOT_TOKEN");

if (!TOKEN) {
	throw new Error("No token provided");
}

const bot = new Bot<ConversationFlavor<Context>>(TOKEN);

// Set bot commands
bot.api.setMyCommands([
	{ command: "start", description: "Start Bot" },
	{ command: "settings", description: "Configure news preferences" },
]);

// Middleware setup
bot.use(
	conversations(),
	startCommand(),
	createConversation(settings),
);

// Command handlers
bot.command("settings", async (ctx) => {
	await ctx.conversation.enter("setting");
});

// Initialize news delivery service
const newsDeliveryService = NewsDeliveryService.getInstance(bot);
newsDeliveryService.startScheduler();

bot.start();
