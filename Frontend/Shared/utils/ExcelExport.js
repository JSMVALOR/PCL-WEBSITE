import ExcelJS from 'exceljs';

export const generateBeautifulExcel = async (title, metaDataArray, columns, dataRows, filename) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export', {
        views: [{ showGridLines: false }]
    });

    // 1. Add Title
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }; // Dark gray
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells(`A1:${String.fromCharCode(64 + columns.length)}1`);
    titleRow.height = 30;

    worksheet.addRow([]); // Spacer

    // 2. Add Meta Data
    metaDataArray.forEach(meta => {
        const row = worksheet.addRow([meta.label, meta.value]);
        row.getCell(1).font = { bold: true };
    });

    worksheet.addRow([]); // Spacer

    // 3. Add Header Row
    const headerRow = worksheet.addRow(columns);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo-600
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };
    });
    headerRow.height = 25;

    // 4. Add Data Rows
    dataRows.forEach((rowData, index) => {
        const row = worksheet.addRow(rowData);
        row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            cell.border = {
                bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
                left: { style: 'hair', color: { argb: 'FFE5E7EB' } },
                right: { style: 'hair', color: { argb: 'FFE5E7EB' } }
            };
        });
        
        // Alternate row colors for readability
        if (index % 2 !== 0) {
            row.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            });
        }
    });

    // 5. Auto-size columns
    worksheet.columns.forEach((column, i) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
            // Ignore title and meta rows when calculating width (assuming header is row 3 + meta data length + 3)
            const headerRowNumber = 3 + metaDataArray.length;
            if (rowNumber >= headerRowNumber && cell.value) {
                const columnLength = cell.value.toString().length;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            }
        });
        column.width = maxLength < 15 ? 15 : maxLength + 5; // Min 15, Max dynamic
    });

    // 6. Generate and Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
