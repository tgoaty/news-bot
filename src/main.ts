import { Bot } from "./deps.ts";
import "jsr:@std/dotenv/load";
import { startCommand } from "./handlers/startCommand.ts";
import { categoriesSelection } from "./handlers/categoriesSelection.ts";
import { languageSelection } from "./handlers/languageSelection.ts";

const TOKEN = Deno.env.get("BOT_TOKEN");

if (!TOKEN) {
	throw new Error("No token provided");
}

const bot = new Bot(TOKEN);
bot.api.setMyCommands([
	{ command: "start", description: "Start Bot" },
	{ command: "languageSelection", description: "Choose language of news" },
	{ command: "categoriesSelection", description: "Choose categories of news" },
]);
bot.use(
	startCommand(),
	languageSelection(),
	categoriesSelection(),
);

bot.start();
