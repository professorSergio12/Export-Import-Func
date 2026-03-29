import { Document, Packer, Paragraph, TextRun } from "docx";
import Excel from '../models/excel.model.js';
import ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';
import fs from 'fs';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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

export const exportExcel = async (req, res) => {
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

export const exportPdf = async (req, res) => {
    try {
        const { name } = req.body || {};
        const displayName = typeof name === 'string' ? name.trim() : '';
        if (!displayName) {
            return res.status(400).json({ message: 'Name is required for the certificate PDF.' });
        }

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlPath = new URL('../template/certificate.html', import.meta.url);
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.split('__CERT_NAME__').join(escapeHtml(displayName));

        await page.setContent(html, { waitUntil: "domcontentloaded" });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        await browser.close();

        // Send PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=certificate.pdf"
        );

        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const generateDocx = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Create document
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "User Details",
                                    bold: true,
                                    size: 32,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun(`Name: ${name}`),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun(`Email: ${email}`),
                            ],
                        }),
                    ],
                },
            ],
        });

        // Convert to buffer
        const buffer = await Packer.toBuffer(doc);

        // Set headers
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=user.docx"
        );

        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating docx" });
    }
};