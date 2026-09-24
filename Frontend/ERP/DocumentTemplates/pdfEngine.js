/* © 2026 JSM VALOR. All Rights Reserved. */
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";

export const generateComponentPDF = async (element, filename = "document.pdf", options = {}) => {
    if (!element) return;
    
    const defaultOptions = {
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        element.classList.add('pdf-export-mode');
        const canvas = await html2canvas(element, mergedOptions);
        element.classList.remove('pdf-export-mode');

        const imgData = canvas.toDataURL("image/png");
        
        const pdf = new jsPDF({
            orientation: options.orientation || "portrait",
            unit: "mm",
            format: options.format || "a4"
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        let printWidth = pdfWidth;
        let printHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (options.fitToPage && printHeight > pdfHeight) {
            printHeight = pdfHeight;
            printWidth = (imgProps.width * pdfHeight) / imgProps.height;
        }

        // Apply slight padding for luxury A4 feel (margins) if requested
        if (options.margin) {
            const margin = options.margin; // in mm
            printWidth -= (margin * 2);
            printHeight = (imgProps.height * printWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", margin, margin, printWidth, printHeight);
        } else {
            pdf.addImage(imgData, "PNG", 0, 0, printWidth, printHeight);
        }

        // --- ENCRYPTION LOGIC ---
        if (options.password) {
            // Get raw array buffer from jsPDF
            const rawPdfBytes = pdf.output('arraybuffer');
            
            // Load it into pdf-lib to encrypt it
        const pdfDoc = await PDFDocument.load(rawPdfBytes);
            const encryptedPdfBytes = await pdfDoc.save({
                useObjectStreams: false,
                userPassword: options.password,
                ownerPassword: options.password + "_admin"
            });

            // Convert back to Blob/Base64
            const blob = new Blob([encryptedPdfBytes], { type: "application/pdf" });
            
            if (options.returnBase64) {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]); // return purely the base64 string
                    reader.readAsDataURL(blob);
                });
            } else {
                // Download encrypted PDF to browser
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return true;
            }
        }

        // --- STANDARD UNENCRYPTED FLOW ---
        if (options.returnBase64) {
            const rawPdfBytes = pdf.output('arraybuffer');
            const blob = new Blob([rawPdfBytes], { type: "application/pdf" });
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(blob);
            });
        }

        pdf.save(filename);
        return true;
    } catch (error) {
        console.error("PDF Generation failed:", error);
        throw error;
    }
};
