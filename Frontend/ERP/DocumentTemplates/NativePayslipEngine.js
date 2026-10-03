import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const loadLogoAsBase64 = async () => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = "/favicon.svg"; 
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 500;
            canvas.height = 500;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, 500, 500);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve(null);
    });
};

export const generateNativePayslip = async (payload, facultyName, erpId, department) => {
    // 1. Create a new A4 PDF
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    // --- BRAND COLORS (Brown & Gold Theme) ---
    const brandBrown = [93, 64, 55]; // #5D4037
    const brandGold = [212, 175, 55]; // #d4af37
    const dark = [26, 26, 46]; // #1a1a2e
    const gray = [100, 116, 139]; // #64748b
    
    // --- PREMIUM BORDER FRAME ---
    // Outer Gold Border
    doc.setDrawColor(...brandGold);
    doc.setLineWidth(0.8);
    doc.roundedRect(10, 10, 190, 277, 2, 2);
    // Inner Lighter Gold Border
    doc.setDrawColor(212, 175, 55); 
    doc.setLineWidth(0.2);
    doc.roundedRect(12, 12, 186, 273, 2, 2);

    // --- HEADER SECTION ---
    const logoData = await loadLogoAsBase64();
    if (logoData) {
        doc.addImage(logoData, "PNG", 30, 22, 22, 22);
    }

    doc.setFont("times", "bold");
    doc.setTextColor(...brandBrown);
    doc.setFontSize(26);
    doc.text("Prudentia College", 115, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(...brandGold);
    doc.text("of Law, Hyderabad", 115, 38, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.setFontSize(9);
    doc.text("Recognized by the Bar Council of India (BCI) & Affiliated to Osmania University", 105, 48, { align: 'center' });

    // Divider
    doc.setDrawColor(15, 23, 42); 
    doc.setLineWidth(0.2);
    doc.line(20, 52, 190, 52);

    // --- PAYSLIP TITLE ---
    doc.setFillColor(...brandBrown);
    doc.roundedRect(80, 57, 50, 8, 1, 1, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandGold);
    doc.setFontSize(11);
    doc.text("TAX PAYSLIP", 105, 63, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...brandBrown);
    doc.setFontSize(10);
    doc.text(`For the month of ${payload.month} ${payload.year}`.toUpperCase(), 105, 71, { align: 'center' });

    // --- EMPLOYEE DETAILS (Enclosed in Boundaries) ---
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(20, 80, 170, 28, 2, 2, 'FD');

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.text("BILLED TO:", 25, 87);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandBrown);
    doc.setFontSize(14);
    doc.text(facultyName, 25, 94);
    
    doc.setFontSize(9);
    doc.setTextColor(...brandGold);
    doc.text(`ERP ID: ${erpId}`, 25, 101);

    // Meta details on the right
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.text("DATE OF ISSUE:", 120, 87);
    doc.text("PAYMENT MODE:", 120, 94);
    doc.text("TRANSACTION ID:", 120, 101);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandBrown);
    doc.text(payload.payment_date || "N/A", 150, 87);
    doc.text(payload.payment_mode || "Bank Transfer", 150, 94);
    doc.text(payload.transaction_id || "N/A", 150, 101);

    // --- LOP DETAILS ---
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 112, 170, 15, 2, 2, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.text(`Leave Without Pay (LOP) Days:`, 25, 121);
    doc.setFont("helvetica", "normal");
    doc.text(`${payload.lop_days || 0}`, 85, 121);
    
    if (payload.lop_waived_days > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(5, 150, 105); // Emerald
        doc.text(`Waived By Admin:`, 110, 121);
        doc.setFont("helvetica", "normal");
        doc.text(`${payload.lop_waived_days} Days`, 145, 121);
    }

    // --- EARNINGS & DEDUCTIONS TABLES ---
    const earningsData = [];
    earningsData.push(["Consolidated Pay", Number(payload.base_pay).toFixed(2)]);
    earningsData.push([{ content: "Total Earnings (A)", styles: { fontStyle: 'bold' } }, { content: Number(payload.base_pay).toFixed(2), styles: { fontStyle: 'bold', textColor: [5, 150, 105] } }]);

    const deductionsData = [];
    const rawLopAmt = payload.gross_lop_amount || payload.deductions;
    if (rawLopAmt > 0) {
        deductionsData.push([{ content: "LOP Deduction", styles: { textColor: [225, 29, 72] } }, { content: Number(rawLopAmt).toFixed(2), styles: { textColor: [225, 29, 72] } }]);
    }
    if (payload.lop_waived_amount > 0) {
        deductionsData.push([{ content: "LOP Waiver Credit", styles: { textColor: [5, 150, 105], fillColor: [236, 253, 245] } }, { content: `- ${Number(payload.lop_waived_amount).toFixed(2)}`, styles: { textColor: [5, 150, 105], fillColor: [236, 253, 245] } }]);
    }
    if (payload.professional_tax > 0) {
        deductionsData.push(["Professional Tax", Number(payload.professional_tax).toFixed(2)]);
    }
    if (payload.tds_amount > 0) {
        deductionsData.push([`TDS (${payload.tds_percentage}%)`, Number(payload.tds_amount).toFixed(2)]);
    }
    
    const totalDeductions = (Number(payload.deductions) || 0) + (Number(payload.professional_tax) || 0) + (Number(payload.tds_amount) || 0);
    deductionsData.push([{ content: "Total Deductions (B)", styles: { fontStyle: 'bold' } }, { content: Number(totalDeductions).toFixed(2), styles: { fontStyle: 'bold', textColor: [225, 29, 72] } }]);

    autoTable(doc, {
        startY: 132,
        margin: { left: 20 },
        tableWidth: 80,
        head: [['Earnings Component', 'Amount (Rs)']],
        body: earningsData,
        headStyles: { fillColor: brandBrown, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        theme: 'grid',
        styles: { fontSize: 9, lineColor: [226, 232, 240] }
    });

    autoTable(doc, {
        startY: 132,
        margin: { left: 110 },
        tableWidth: 80,
        head: [['Deductions Component', 'Amount (Rs)']],
        body: deductionsData,
        headStyles: { fillColor: brandBrown, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        theme: 'grid',
        styles: { fontSize: 9, lineColor: [226, 232, 240] }
    });

    // --- NET PAY BOX ---
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setDrawColor(...brandBrown);
    doc.setFillColor(...brandBrown);
    doc.roundedRect(20, finalY, 170, 35, 2, 2, 'FD');
    
    doc.setFont("times", "bold");
    doc.setTextColor(...brandGold);
    doc.setFontSize(16);
    doc.text("Net Disbursal (Earnings - Deductions)", 30, finalY + 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Transferred via ${payload.payment_mode || 'Bank Transfer'}`, 30, finalY + 23);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text(`Rs. ${Number(payload.final_net_pay || payload.net_pay - (payload.professional_tax || 0) - (payload.tds_amount || 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 180, finalY + 21, { align: 'right' });

    // --- SIGNATURES ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.text("System Administrator", 30, 250);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text("Prudentia College of Law", 30, 255);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text("Registrar (Finance)", 140, 250);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text("Prudentia College of Law", 140, 255);
    
    // Digital Signature Line
    doc.setDrawColor(226, 232, 240);
    doc.line(30, 245, 75, 245);
    doc.line(140, 245, 185, 245);
    
    // Footer Watermark
    doc.setFont("helvetica", "italic");
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text("This is a computer generated document and does not require a physical signature.", 105, 280, { align: 'center' });

    // --- EXPORT & ENCRYPT ---
    const arrayBuffer = doc.output('arraybuffer');
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};
