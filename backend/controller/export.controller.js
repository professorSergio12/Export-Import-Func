import Excel from '../models/excel.model.js';
import ExcelJS from 'exceljs';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Excel / DB se jo bhi date aaye — output: 29-Oct-2025 */
function formatDateCell(value) {
  if (value == null || value === '') return '';

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const day = String(d.getDate()).padStart(2, '0');
  const mon = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${mon}-${year}`;
}

export const exportFile = async (req, res) => {
    try {
        const data = await Excel.find();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Stocks');

        worksheet.columns = [
            { header: "MKT", key: "MKT", width: 10 },
            { header: "SERIES", key: "SERIES", width: 10 },
            { header: "SYMBOL", key: "SYMBOL", width: 15 },
            { header: "SECURITY", key: "SECURITY", width: 25 },
            { header: "CLOSE_PRICE", key: "CLOSE_PRICE", width: 15 },
            { header: "DATE", key: "DATE", width: 20 },
            { header: "ISIN", key: "ISIN", width: 25 },
        ];

        data.forEach(item => {
            worksheet.addRow({
                MKT: item.MKT,
                SERIES: item.SERIES,
                SYMBOL: item.SYMBOL,
                SECURITY: item.SECURITY,
                CLOSE_PRICE: item.CLOSE_PRICE,
                DATE: formatDateCell(item.DATE),
                ISIN: item.ISIN,
            })
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Stocks.xlsx"
        );
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}