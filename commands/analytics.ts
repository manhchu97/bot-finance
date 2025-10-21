import { Message } from "discord.js";
import { KEYWORDS, findByKey } from "../utils/index";
import { GoogleSheetsService } from "../services/sheets";

export const command = {
  name: "analytics",
  description: "Analytics !",

  execute: async (message: Message,channel:string) => {
    const sheets = new GoogleSheetsService().init();
    const data: any = await sheets.getAllData(channel);
    const totalCapital = data.reduce((total, item) => {
      // Kiểm tra và chuyển giá trị VỐN thành số
      const capital = +item["VỐN"] || 0;
      return total + capital;
    }, 0);

    const totalPrice = data.reduce((total, item) => {
      // Kiểm tra và chuyển giá trị VỐN thành số
      const price = +item["GIÁ"] || 0;
      return total + price;
    }, 0);

    const tongThu = data.reduce((total, item) => {
      // Kiểm tra và chuyển giá trị VỐN thành số
      const price = +item["ĐÃ TRẢ"] || 0;
      return total + price;
    }, 0);

    const tongNo = data.reduce((total, item) => {
      // Kiểm tra và chuyển giá trị VỐN thành số
      const price = +item["CÒN THIẾU"] || 0;
      return total + price;
    }, 0);

    await message.reply(
      `Tổng giá nhập acc: ${totalCapital}\nTổng giá bán ra: ${totalPrice}\nTổng thu: ${tongThu}\nTổng nợ: ${tongNo}`
    );
  },
};
