import { google, sheets_v4 } from "googleapis";
import path from "path";

const credentialsPath = path.resolve(
  __dirname,
  "./../regal-crowbar-319804-45dc62936413.json"
);
const spreadsheetId = process.env.SHEET_TOKEN || "";

interface SheetDataItem {
  ROW?: number;
  TASK?: string;
  ACCOUNT?: string;
  NAME?: string;
  "START TIME"?: string;
  "END TIME"?: string;
  GIÁ?: string;
  "ĐÃ TRẢ"?: string;
  "CÒN THIẾU"?: string;
  DESCRIPTION?: string;
  NOTES?: string;
  STATUS?: string;
  [key: string]: any; // cho phép các key động
}

export class GoogleSheetsService {
  private credentialsPath: string;
  private spreadsheetId: string;
  private sheets: sheets_v4.Sheets | null = null;

  constructor() {
    this.credentialsPath = credentialsPath;
    this.spreadsheetId = spreadsheetId;
  }

  init() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.credentialsPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });

    return this;
  }

  getKey(): string {
    return this.spreadsheetId;
  }

  async getHeaderRow(sheetName = "Sheet1"): Promise<string[]> {
    if (!this.sheets) {
      throw new Error("Google Sheets API not initialized. Call init() first.");
    }

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    const headerRow = response.data.values ? response.data.values[0] : [];
    if (!headerRow || headerRow.length === 0) {
      throw new Error("Failed to retrieve header row from the sheet.");
    }

    return headerRow;
  }

  /**
   * Insert data into the specified range of the sheet based on headers.
   * @param data Array of objects to insert
   * @param range Sheet name and range (e.g., 'Sheet1!A1')
   */
  async insertData(
    data: SheetDataItem[],
    sheetName = "Sheet1"
  ): Promise<{ success: boolean }> {
    if (!this.sheets) {
      throw new Error("Google Sheets API not initialized. Call init() first.");
    }

    try {
      const headers = await this.getHeaderRow(sheetName);

      console.log(headers,'headers')
      const values = data.map((item) =>
        headers.map((header) => item[header] || "")
      );

      console.log(values)

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });

      return { success: true };
    } catch (error) {
      console.error("Error inserting data:", error);
      return { success: false };
    }
  }

  async updateDataBasedOnColumn(item: SheetDataItem,sheetName:string): Promise<void> {
    if (!this.sheets) {
      throw new Error("Google Sheets API not initialized. Call init() first.");
    }

    try {
      const row = item.ROW;
      if (!row) throw new Error("ROW number is required for update.");

      // Define range assuming columns A to L
      const range = `${sheetName}!A${row}:L${row}`;

      const values = [
        [
          item.TASK || "",
          item.ACCOUNT || "",
          item.NAME || "",
          item["START TIME"] || "",
          item["END TIME"] || "",
          item.GIÁ || "",
          item["ĐÃ TRẢ"] || "",
          item["CÒN THIẾU"] || "",
          item.DESCRIPTION || "",
          item.NOTES || "",
          item.STATUS || "",
        ],
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    } catch (error) {
      console.error("Error updating data:", error);
    }
  }

  /**
   * Retrieve all data from the specified sheet.
   * @param sheetName Optional name of the sheet (e.g., "FreeFire")
   * @param range Optional cell range (default "A1:Z")
   * @returns Array of data objects
   */
  async getAllData(
    sheetName: string = "Sheet1",
    range: string = "A1:Z"
  ): Promise<SheetDataItem[]> {
    if (!this.sheets) {
      throw new Error("Google Sheets API not initialized. Call init() first.");
    }

    try {
      // ✅ Lấy danh sách tất cả các sheet trong spreadsheet
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheets = spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

      // ✅ Kiểm tra xem sheetName có tồn tại không
      if (!sheets.includes(sheetName)) {
        console.warn(`Sheet "${sheetName}" not found in spreadsheet.`);
        return [];
      }

      const fullRange = `${sheetName}!${range}`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: fullRange,
      });

      const rows = response.data.values;

      if (rows && rows.length > 0) {
        const headers = rows[0];
        return rows.slice(1).map((row, index) => {
          const dataObject: SheetDataItem = { ROW: index + 2 };
          headers.forEach((header, i) => {
            dataObject[header] = row[i] || "";
          });
          return dataObject;
        });
      }

      return [];
    } catch (error) {
      console.error("Error retrieving data:", error);
      return [];
    }
  }
}
