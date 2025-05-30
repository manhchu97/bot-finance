import { Message } from "discord.js";
import { KEYWORDS, findByKey } from "../utils/index";
import { GoogleSheetsService } from "../services/sheets";

export const command = {
  name: "show",
  description: "Show!",

  execute: async (message: Message) => {
    const sheets = new GoogleSheetsService().init();
    let msg = `https://docs.google.com/spreadsheets/d/${sheets.getKey()}`;
    await message.reply(msg);
  },
};
