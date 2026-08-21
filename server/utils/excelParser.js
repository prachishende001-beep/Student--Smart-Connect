const xlsx = require('xlsx');

const parseExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const datasheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(datasheet);
};

module.exports = { parseExcel };
