/* © 2026 JSM VALOR. All Rights Reserved. */
// src/lib/pdfGenerator.js

/**
 * Triggers native browser print-to-PDF by hiding non-printable elements.
 * For a real production app, you might want to use a server-side PDF generator 
 * or a heavy client-side lib like jspdf. But native print is clean and responsive.
 */
export const generatePDF = (title = "Document") => {
    // 1. Temporarily change document title so the saved PDF has a nice default name
    const originalTitle = document.title;
    document.title = title;

    // 2. Add print-specific CSS dynamically
    const style = document.createElement('style');
    style.id = 'pdf-print-styles';
    style.innerHTML = `
        @media print {
            body * {
                visibility: hidden;
            }
            .printable-area, .printable-area * {
                visibility: visible;
            }
            .printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
                background-color: white !important;
                color: black !important;
            }
            .no-print {
                display: none !important;
            }
            /* Hide scrolling containers */
            main {
                overflow: visible !important;
                height: auto !important;
            }
        }
    `;
    document.head.appendChild(style);

    // 3. Trigger print dialog (Users can select "Save as PDF")
    window.print();

    // 4. Cleanup
    setTimeout(() => {
        document.title = originalTitle;
        const styleElement = document.getElementById('pdf-print-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }, 1000);
};

/**
 * Helper to download raw text/CSV content as a file
 */
export const downloadFile = (filename, content, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
