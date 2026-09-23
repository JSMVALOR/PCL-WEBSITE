import re

with open('src/ERP/components/Student/CVBuilder/CVBuilder.jsx', 'r') as f:
    content = f.read()

old_handle = """    const handleExport = async () => {
        setIsExporting(true);
        const getTargetElement = () => document.getElementById('cv-pdf-target');
        const filename = `${erpData.personal.name.replace(/\s+/g, '_')}_PCL_CV.pdf`;
        
        try {
            await generatePDF(getTargetElement, {
                filename: filename,
                resolution: Resolution.HIGH,
                page: { margin: Margin.NONE, format: 'a4' },
                canvas: { scale: 2, useCORS: true }
            });
        } catch (error) {
            console.error("PDF Export failed", error);
        } finally {
            setIsExporting(false);
        }
    };"""

new_handle = """    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            window.print();
            setIsExporting(false);
        }, 300);
    };"""

content = content.replace(old_handle, new_handle)

with open('src/ERP/components/Student/CVBuilder/CVBuilder.jsx', 'w') as f:
    f.write(content)
