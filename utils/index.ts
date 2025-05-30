export const KEYWORDS = {
  ACCOUNT: "Tài khoản:",
  NAME: "Người trả góp:",
  TIME: "Thời gian:",
  PRICE: "Giá:",
  PAID: "Đã trả:",
  MISSING: "Còn thiếu:",
  NOTES: "Ghi chú:",
  KEYWORD: "từ khóa:",
  ROW: "Row:",
  STATUS: "Status:",
  ORIGINAL_PRICE: "Vốn:",
};

export const findByKey = (array, keyword) => {
  return (array.find((item) => item.indexOf(keyword) !== -1) || "")
    .replace(keyword, "")
    .trim();
};

function parseDates(dateRange) {
  const dates = dateRange.split("-").map((date) => date.trim());
  if (dates.length < 1 || dates.length > 2) {
    return null;
  }

  const startTime = dates[0] || "";
  const endTime = dates[1] ? dates[1] : dates[0] || "";

  const startCount = (startTime.match(/\//g) || []).length;
  const endCount = (endTime.match(/\//g) || []).length;

  if ((startTime && startCount < 2) || (endCount && endCount < 2)) {
    return null;
  }

  return {
    startTime: startTime === endTime ? null : startTime,
    endTime,
  };
}

export function mappingArrayMsgToObj(array, task) {
  const obj: any = {
    TASK: task,
    STATUS: "PENDING",
  };
  const account = findByKey(array, KEYWORDS.ACCOUNT);
  const name = findByKey(array, KEYWORDS.NAME);
  const times = findByKey(array, KEYWORDS.TIME);
  const price = findByKey(array, KEYWORDS.PRICE);
  const paid = findByKey(array, KEYWORDS.PAID);
  const missing = findByKey(array, KEYWORDS.MISSING);
  const notes = findByKey(array, KEYWORDS.NOTES);
  const status = findByKey(array, KEYWORDS.STATUS);
  const originalPrice = findByKey(array, KEYWORDS.ORIGINAL_PRICE);

  if (account) {
    obj.ACCOUNT = account;
  }

  if (name) {
    obj.NAME = name;
  }

  if (!times) return null;
  if (times) {
    const objDate = parseDates(times);
    if (!objDate) return null;
    obj["START TIME"] = objDate.startTime;
    obj["END TIME"] = objDate.endTime;
  }

  if (price) {
    obj["GIÁ"] = price;
  }

  if (paid) {
    obj["ĐÃ TRẢ"] = paid;
  }

  if (missing) {
    obj["CÒN THIẾU"] = missing;
  }

  if (notes) {
    obj["NOTES"] = notes;
  }

  if (status && (status === "successed" || status === "SUCCESSED")) {
    obj["STATUS"] = status;
  }

  if (originalPrice) {
    obj["VỐN"] = originalPrice;
  }

  return obj;
}

export const LIST_ACTION = {
  HELP: "HELP",
  FIND_BY_KEYWORD: "FIND_BY_KEYWORD",
  UPDATE: "UPDATE",
  REMINDER: "REMINDER",
  DELETE: "DELETE",
  SHOW: "SHOW",
  ANALYTICS: "ANALYTICS",
};
