/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { createContext, useContext, useState } from 'react';

export const PreviewContext = createContext();

export function PreviewProvider({ children }) {
    const [previewData, setPreviewData] = useState({});

    const updatePreviewData = (pagePath, sectionId, data) => {
        setPreviewData(prev => ({
            ...prev,
            [`${pagePath}::${sectionId}`]: data
        }));
    };

    return (
        <PreviewContext.Provider value={{ previewData, updatePreviewData }}>
            {children}
        </PreviewContext.Provider>
    );
}

export function usePreview() {
    return useContext(PreviewContext);
}
