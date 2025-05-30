import "dotenv/config";
import { client } from "./client";
import * as path from "path";
import * as fs from "fs";
import { Message } from "discord.js";

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("Bạn cần tạo file .env với BOT_TOKEN=your_token");
  process.exit(1);
}

// Load tất cả commands từ thư mục commands
const commands = new Map<
  string,
  {
    name: string;
    description: string;
    execute: (message: Message, args: string[]) => Promise<void>;
  }
>();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

for (const file of commandFiles) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const commandModule = require(path.join(commandsPath, file));
  const command = commandModule.command;
  if (command && command.name) {
    commands.set(command.name, command);
    console.log(`Loaded command: /${command.name}`);
  }
}

client.on("ready", () => {
  console.log(`Bot đã đăng nhập với tên ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith("/")) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);
  if (!command) {
    await message.reply(`Lệnh không hợp lệ: ${commandName}`);
    return;
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error("Lỗi khi chạy lệnh:", error);
    await message.reply("Đã xảy ra lỗi khi thực hiện lệnh.");
  }
});

client.login(TOKEN);
