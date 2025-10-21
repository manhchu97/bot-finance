import { Message } from "discord.js";
import {
  KEYWORDS,
  findByKey,
  mappingArrayMsgToObj,
  LIST_ACTION,
} from "../utils/index";
import { GoogleSheetsService } from "../services/sheets";

export const command = {
  name: "update",
  description: "Update",

  execute: async (message: Message,channel:string) => {
    const sheets = new GoogleSheetsService().init();
    const text = message.content;
    let reply = "";
    const allData: any[] = await sheets.getAllData(channel);
    const messageArray = text.split("\n") || [];
    const row = findByKey(messageArray, KEYWORDS.ROW);
    const detail = allData.find((item) => +item.ROW === +row);
    const obj = {
      ...mappingArrayMsgToObj(messageArray, LIST_ACTION.REMINDER),
      ROW: row,
    };

    if (!detail) {
      reply = `Không tìm thấy bản ghi`;
    }
    await sheets.updateDataBasedOnColumn(obj,channel);
    reply = `Update thành công !`;

    await message.reply(reply);
  },
};
