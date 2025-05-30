import { Message } from "discord.js";
import { KEYWORDS, findByKey } from "./../utils/index";
import { GoogleSheetsService } from "./../services/sheets";

export const command = {
  name: "find",
  description: "Tìm keyword !",

  execute: async (message: Message) => {
    const sheets = new GoogleSheetsService().init();
    let msg = "";
    const text = message.content;
    const messageArray = text.split("\n") || [];
    const allData = await sheets.getAllData();
    const list: any[] = [];
    const keyword = findByKey(messageArray, KEYWORDS.KEYWORD);
    const fieldSearch = ["ACCOUNT", "NAME", "START TIME", "END TIME", "NOTES"];
    for (const search of fieldSearch) {
      const dataSearch: any = allData.filter(
        (item) => item[search].indexOf(keyword) !== -1
      );
      for (const item of dataSearch) {
        const checkExist = list.find((data) => data.ROW === item.ROW);
        if (!checkExist) {
          list.push(item);
        }
      }
    }

    if (list.length === 0) {
      msg = `Không tìm thấy bản ghi phù hợp !`;
    } else {
      for (const item of list) {
        if (item.ACCOUNT !== "") {
          msg += `\n\nRow:${item.ROW}\nTài khoản:${
            item.ACCOUNT
          }\nNgười trả góp:${item.NAME}\nThời gian:${
            item.startTime
              ? `${item["START TIME"]} - ${item["END TIME"]}`
              : `${item["END TIME"]}`
          }\nVốn:${item["VỐN"]}\nGiá:${item["GIÁ"]}\nĐã trả:${
            item["ĐÃ TRẢ"]
          }\nCòn thiếu:${item["CÒN THIẾU"]}\nGhi chú:${item.NOTES}`;
        } else {
          msg += `\n\nRow:${item.ROW}\nThời gian:${item["END TIME"]}\Ghi chú:${item.NOTES}`;
        }
      }
    }

    await message.reply(msg);
  },
};
