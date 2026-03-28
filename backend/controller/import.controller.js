import ExcelJS from 'exceljs';
import Excel from '../models/excel.model.js';

export const importFile = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const workbook = new ExcelJS.Workbook(); //Excel file ko represent karne ke liye object create
      await workbook.xlsx.load(req.file.buffer); //Excel file ko load kar rahe ho
  
      const worksheet = workbook.getWorksheet(1); //Excel ki first sheet access kar rahe ho
  
      const batch = [];
      const BATCH_SIZE = 1000;
  
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
  
        batch.push({
          MKT: row.getCell(1).value,
          SERIES: row.getCell(2).value,
          SYMBOL: row.getCell(3).value,
          SECURITY: row.getCell(4).value,
          CLOSE_PRICE: Number(row.getCell(5).value),
          DATE: new Date(row.getCell(6).value),
          ISIN: row.getCell(7).value,
        });
  
        if (batch.length === BATCH_SIZE) {
          await Excel.insertMany(batch);
          batch.length = 0;
        }
      }
  
      // Remaining data
      if (batch.length > 0) {
        await Excel.insertMany(batch);
      }
  
      res.status(200).json({
        message: 'File imported successfully'
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };