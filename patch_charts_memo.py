import re

filepath = 'src/ERP/components/shared/DashboardWidgets/AdminCampusPulse.jsx'
with open(filepath, 'r') as f:
    text = f.read()

if 'useMemo' not in text:
    text = text.replace('import React, { useState, useEffect } from', 'import React, { useState, useEffect, useMemo } from')
    
# Wrap the return
if 'const chartContent = useMemo(' not in text:
    chart_block_regex = r'(<ResponsiveContainer[\s\S]*?</ResponsiveContainer>)'
    match = re.search(chart_block_regex, text)
    if match:
        chart_code = match.group(1)
        replacement = f"const chartContent = useMemo(() => (\n      {chart_code}\n    ), [data]);\n\n    return (\n        <div className={{`w-full h-full flex flex-col ${{className}}`}}>\n            {{loading ? (\n                <div className=\"flex-1 flex items-center justify-center\">\n                    <div className=\"w-6 h-6 border-2 border-themeAccent border-t-transparent rounded-full animate-spin\"></div>\n                </div>\n            ) : chartContent}}\n        </div>\n    );"
        # Replace the entire return block
        text = re.sub(r'return \([\s\S]*?</ResponsiveContainer>\s*</div>\s*\);', replacement, text)

with open(filepath, 'w') as f:
    f.write(text)

print("Memoized AdminCampusPulse")
