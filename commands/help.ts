import { Message } from "discord.js";
import { KEYWORDS } from "./../utils/index";

export const command = {
  name: "help",
  description: "Hiển thị danh sách lệnh",

  execute: async (message: Message) => {
    let msg = "";
    msg = `Dưới đây là hướng dẫn bạn sử dụng các tính năng của chatbot Reminder:\n`;
    msg += `\n\n*Để thông báo đến hạn trả góp nhập:*\n/reminder\n${KEYWORDS.ACCOUNT}\nNgười trả góp:\nThời gian:\nVốn:\nGiá:\nĐã trả:\nCòn thiếu:\nGhi chú:\nStatus: SUCCESSED`;
    msg += `\n\n*Tìm bản ghi:*\n/find\ntừ khóa:`;
    msg += `\n\n*Cập nhập bản ghi:*\n/update\nColumn:\n${KEYWORDS.ACCOUNT}\nNgười trả góp:\nThời gian:\nVốn:\nGiá:\nĐã trả:\nCòn thiếu:\nGhi chú:`;
    msg += `\n\n*Show doanh thu:*\n/analytics\n`;
    msg += `\n\n*Show link excel:*\n/show-excel`;
    await message.reply(msg);
  },
};
