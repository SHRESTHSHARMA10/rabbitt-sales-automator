const path = require('path');
const XLSX = require('xlsx');
const { parse } = require('csv-parse/sync');

// ─── Parse an uploaded file (CSV or XLSX) into a JSON array ───
// Takes the multer file object (which has .buffer, .originalname, etc.)
// Returns an array of objects like: [{ Date: "2026-01-05", Region: "North", ... }, ...]
const parseFile = (file) => {
  // Get the file extension to decide which parser to use
  const ext = path.extname(file.originalname).toLowerCase();

  let data;

  if (ext === '.csv') {
    data = parseCSV(file.buffer);
  } else if (ext === '.xlsx') {
    data = parseXLSX(file.buffer);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  // Make sure we actually got some data rows
  if (!data || data.length === 0) {
    throw new Error('The uploaded file is empty or has no readable data.');
  }

  return data;
};

// ─── CSV Parser ───
// Converts CSV text into an array of objects.
// The first row is treated as column headers.
const parseCSV = (buffer) => {
  // Convert the file buffer (raw bytes) into a UTF-8 string
  const csvText = buffer.toString('utf-8');

  // csv-parse/sync turns the CSV string into an array of objects
  const records = parse(csvText, {
    columns: true,         // use the first row as keys (e.g., "Date", "Region")
    skip_empty_lines: true, // ignore blank lines
    trim: true,             // remove extra whitespace from values
  });

  return records;
};

// ─── XLSX Parser ───
// Converts an Excel file into an array of objects.
// Only reads the FIRST sheet in the workbook.
const parseXLSX = (buffer) => {
  // Read the Excel workbook from the buffer
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // Get the name of the first sheet
  const firstSheetName = workbook.SheetNames[0];

  // Get the actual sheet data
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert the sheet to a JSON array (first row = headers)
  const records = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return records;
};

module.exports = { parseFile };
