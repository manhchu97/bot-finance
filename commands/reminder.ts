import { Message } from "discord.js";
import {
  KEYWORDS,
  findByKey,
  mappingArrayMsgToObj,
  LIST_ACTION,
} from "./../utils/index";
import { GoogleSheetsService } from "./../services/sheets";

export const command = {
  name: "reminder",
  description: "Thêm reminder",

  execute: async (message: Message) => {
    const sheets = new GoogleSheetsService().init();
    const text = message.content;
    const messageArray = text.split("\n") || [];
    const obj = mappingArrayMsgToObj(messageArray, LIST_ACTION.REMINDER);
    if (!obj) return message.reply("Data không hợp lệ !!!");
    const response = await sheets.insertData([{ ...obj }]);
    let reply = "";
    if (response.success) {
      reply = "Thêm thành công !";
    } else {
      reply = "Thêm thất bại !";
    }

    await message.reply(reply);
  },
};
