import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const pdfParse = require('pdf-parse');  // Use `require`
import puppeteer from 'puppeteer';
import { Document, Packer, Paragraph } from 'docx';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

ipcMain.handle('open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Select a Document',
    filters: [{ name: 'Documents', extensions: ['pdf', 'docx'] }],
    properties: ['openFile'],
  });

  if (filePaths.length === 0) return null;

  return path.resolve(filePaths[0]);
});

ipcMain.handle('convert-file', async (_event, filePath, conversionType) => {
  if (!filePath) {
    console.error("Invalid file path received");
    return null;
  }

  const absoluteFilePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  console.log("Attempting to open file:", absoluteFilePath);

  if (!fs.existsSync(absoluteFilePath)) {
    console.error("File not found:", absoluteFilePath);
    return null;
  }

  const outputDir = path.dirname(absoluteFilePath);
  const outputFilePath = path.join(outputDir, `converted-${Date.now()}`);

  try {
    if (conversionType === 'pdf-to-word') {
      const pdfBytes = fs.readFileSync(absoluteFilePath);
      const pdfData = await pdfParse(pdfBytes);
      const text = pdfData.text;

      const doc = new Document({
        sections: [{ properties: {}, children: [new Paragraph(text)] }],
      });

      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(`${outputFilePath}.docx`, buffer);
    } 
    
    else if (conversionType === 'pdf-to-ppt') {
      fs.copyFileSync(absoluteFilePath, `${outputFilePath}.pptx`);
    } 
    
    else if (conversionType === 'docx-to-pdf') {
      const docxBytes = fs.readFileSync(absoluteFilePath);
      const { value: htmlContent } = await mammoth.convertToHtml({ buffer: docxBytes });

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      await page.pdf({ path: `${outputFilePath}.pdf`, format: 'A4' });
      await browser.close();
    }

    return `${outputFilePath}.${conversionType.includes('pdf') ? 'pdf' : 'docx'}`;
  } catch (error) {
    console.error('Conversion failed:', error);
    return null;
  }
});

ipcMain.handle('download-file', async (_event, filePath) => {
  const { filePath: savePath } = await dialog.showSaveDialog({
    title: 'Save Converted File',
    defaultPath: filePath,
  });

  if (savePath) {
    fs.copyFileSync(filePath, savePath);
  }
});
