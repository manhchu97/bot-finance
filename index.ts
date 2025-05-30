import "dotenv/config";
import { client } from "./client";
import * as path from "path";
import * as fs from "fs";
import { Message, TextChannel, NewsChannel, ThreadChannel } from "discord.js";
import cron from "node-cron";
import { GoogleSheetsService } from "./services/sheets";
import * as dayjs from "dayjs";

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

  cron.schedule("0 12 * * *", async () => {
    const dateNow = dayjs().format("D/MM/YYYY");
    const sheetsInstance = new GoogleSheetsService().init();
    const data = await sheetsInstance.getAllData();
    const itemsHandle = data.filter(
      (item) => item["END TIME"] === dateNow && item.STATUS === "PENDING"
    );

    if (itemsHandle.length > 0) {
      for (const item of itemsHandle) {
        const channel = client.channels.cache.get(item.CHAT_ID);

        try {
          let msg = "";
          if (item.ACCOUNT !== "") {
            msg += `*Đến hẹn lại lên*\n\nRow:${item.ROW}\nTài khoản:${
              item.ACCOUNT
            }\nNgười trả góp:${item.NAME}\nThời gian:${
              item.startTime
                ? `${item["START TIME"]} - ${item["END TIME"]}`
                : `${item["END TIME"]}`
            }\nGiá:${item["GIÁ"]}\nĐã trả:${item["ĐÃ TRẢ"]}\nCòn thiếu:${
              item["CÒN THIẾU"]
            }\nGhi chú:${item.NOTES}`;
          } else {
            msg += `\n\nRow:${item.ROW}\nThời gian:${item["END TIME"]}\Ghi chú:${item.NOTES}`;
          }

          await sheetsInstance.updateDataBasedOnColumn({
            ...item,
            STATUS: "SUCCESSED",
          });
          if (
            channel &&
            (channel instanceof TextChannel ||
              channel instanceof NewsChannel ||
              channel instanceof ThreadChannel)
          ) {
            channel.send(msg);
          } else {
            console.error("Channel không phải dạng có thể gửi tin nhắn");
          }
        } catch (error) {}
      }
    }
  });
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
