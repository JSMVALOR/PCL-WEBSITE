import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PDFDocument } from "pdf-lib";

export const generateNativePayslip = async (payload, facultyName, erpId, department) => {
    // 1. Create a new A4 PDF
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    // --- BRAND COLORS ---
    const gold = [181, 156, 114]; 
    const dark = [28, 28, 30]; 
    const gray = [100, 100, 100];
    
    // --- OUTER LUXURY BORDER ---
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.rect(10, 10, 190, 277);
    doc.setLineWidth(0.2);
    doc.rect(12, 12, 186, 273);

    // --- LOGO / HEADER ---
    doc.setFont("times", "bold");
    doc.setTextColor(...gold);
    doc.setFontSize(28);
    doc.text("PRUDENTIA COLLEGE OF LAW", 105, 28, { align: 'center' });
    
    doc.setFont("times", "italic");
    doc.setTextColor(...dark);
    doc.setFontSize(12);
    doc.text("Empowering minds, strengthening society.", 105, 35, { align: 'center' });
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gray);
    doc.setFontSize(18);
    doc.text("OFFICIAL PAYSLIP", 105, 48, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`For the month of ${payload.month} ${payload.year}`.toUpperCase(), 105, 54, { align: 'center' });

    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);

    // --- EMPLOYEE DETAILS ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.text("Employee Name:", 20, 70);
    doc.text("Employee ID:", 20, 78);
    doc.text("Department:", 20, 86);
    
    doc.setFont("helvetica", "normal");
    doc.text(facultyName, 55, 70);
    doc.text(erpId, 55, 78);
    doc.text(department || "Faculty of Law", 55, 86);

    // Payment Meta
    doc.setFont("helvetica", "bold");
    doc.text("Payment Date:", 120, 70);
    doc.text("Payment Mode:", 120, 78);
    doc.text("Disbursing Bank:", 120, 86);
    
    doc.setFont("helvetica", "normal");
    doc.text(payload.payment_date, 155, 70);
    doc.text(payload.payment_mode, 155, 78);
    doc.text("ICICI (024305013005)", 155, 86);

    // --- LOP DETAILS ---
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(20, 95, 170, 15, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(`Leave Without Pay (LOP) Days:`, 25, 104);
    doc.setFont("helvetica", "normal");
    doc.text(`${payload.lop_days || 0}`, 85, 104);
    
    if (payload.lop_waived_days > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(5, 150, 105); // Emerald
        doc.text(`Waived By Admin:`, 110, 104);
        doc.setFont("helvetica", "normal");
        doc.text(`${payload.lop_waived_days} Days`, 145, 104);
    }

    // --- EARNINGS & DEDUCTIONS TABLES ---
    // Prepare Earnings Data
    const earningsData = [];
    earningsData.push(["Consolidated Pay", Number(payload.base_pay).toFixed(2)]);
    earningsData.push([{ content: "Total Earnings (A)", styles: { fontStyle: 'bold' } }, { content: Number(payload.base_pay).toFixed(2), styles: { fontStyle: 'bold', textColor: [5, 150, 105] } }]);

    // Prepare Deductions Data
    const deductionsData = [];
    const rawLopAmt = payload.gross_lop_amount || payload.deductions;
    if (rawLopAmt > 0) {
        deductionsData.push([{ content: "LOP Deduction", styles: { textColor: [225, 29, 72] } }, { content: Number(rawLopAmt).toFixed(2), styles: { textColor: [225, 29, 72] } }]);
    }
    if (payload.lop_waived_amount > 0) {
        deductionsData.push([{ content: "LOP Waiver Credit", styles: { textColor: [5, 150, 105], fillColor: [236, 253, 245] } }, { content: `- ${Number(payload.lop_waived_amount).toFixed(2)}`, styles: { textColor: [5, 150, 105], fillColor: [236, 253, 245] } }]);
    }
    
    const totalDeductions = payload.deductions;
    deductionsData.push([{ content: "Total Deductions (B)", styles: { fontStyle: 'bold' } }, { content: Number(totalDeductions).toFixed(2), styles: { fontStyle: 'bold', textColor: [225, 29, 72] } }]);

    // Render AutoTables
    autoTable(doc, {
        startY: 120,
        margin: { left: 20 },
        tableWidth: 80,
        head: [['Earnings Component', 'Amount (Rs)']],
        body: earningsData,
        headStyles: { fillColor: dark, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [246, 244, 240] },
        theme: 'grid',
        styles: { fontSize: 9 }
    });

    autoTable(doc, {
        startY: 120,
        margin: { left: 110 },
        tableWidth: 80,
        head: [['Deductions Component', 'Amount (Rs)']],
        body: deductionsData,
        headStyles: { fillColor: dark, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [246, 244, 240] },
        theme: 'grid',
        styles: { fontSize: 9 }
    });

    // --- NET PAY BOX ---
    const finalY = doc.lastAutoTable.finalY + 20;
    
    doc.setDrawColor(...gold);
    doc.setFillColor(...dark);
    doc.roundedRect(20, finalY, 170, 35, 3, 3, 'FD');
    
    doc.setFont("times", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Net Disbursal (Earnings - Deductions)", 30, finalY + 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Transferred via ${payload.payment_mode}`, 30, finalY + 22);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gold);
    doc.setFontSize(26);
    doc.text(`Rs. ${Number(payload.final_net_pay).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 180, finalY + 20, { align: 'right' });

    // --- SIGNATURES ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.text("System Administrator", 30, 260);
    doc.setFont("helvetica", "normal");
    doc.text("Prudentia College of Law", 30, 265);

    doc.text("Registrar (Finance)", 140, 260);
    doc.text("Prudentia College of Law", 140, 265);
    
    // Digital Signature Line
    doc.setDrawColor(200, 200, 200);
    doc.line(30, 255, 75, 255);
    doc.line(140, 255, 185, 255);

    // --- EXPORT & ENCRYPT ---
    // Extract raw ArrayBuffer from jsPDF
    const rawPdfBytes = doc.output('arraybuffer');
    
    // Return raw PDF bytes (Unlocked as requested)
    const encryptedPdfBytes = rawPdfBytes;

    // Convert back to Base64 String for return
    const bytes = new Uint8Array(encryptedPdfBytes);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};
