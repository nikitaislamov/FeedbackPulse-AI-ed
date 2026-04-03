import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return parseCSV(file);
  } else if (extension === "xlsx" || extension === "xls") {
    return parseExcel(file);
  } else {
    throw new Error("Неподдерживаемый формат файла. Используйте CSV или Excel.");
  }
}

async function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        resolve({ headers, rows });
      },
      error: (error) => {
        reject(new Error(`Ошибка парсинга CSV: ${error.message}`));
      },
    });
  });
}

async function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
          header: 1,
          defval: "",
        }) as string[][];
        
        if (jsonData.length === 0) {
          reject(new Error("Файл пуст"));
          return;
        }
        
        const headers = jsonData[0].map((h) => String(h).trim());
        const rows = jsonData.slice(1).map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = String(row[index] || "").trim();
          });
          return obj;
        });
        
        resolve({ headers, rows });
      } catch {
        reject(new Error("Ошибка чтения Excel файла"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Ошибка чтения файла"));
    };
    
    reader.readAsBinaryString(file);
  });
}

export function validateReviews(
  rows: Record<string, string>[],
  textColumn: string,
  ratingColumn?: string
): { text: string; rating?: number }[] {
  return rows
    .filter((row) => row[textColumn]?.trim())
    .slice(0, 50) // Ограничение для MVP
    .map((row) => ({
      text: row[textColumn].trim(),
      rating: ratingColumn && row[ratingColumn] 
        ? parseFloat(row[ratingColumn]) 
        : undefined,
    }));
}
