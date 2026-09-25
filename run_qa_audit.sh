#!/bin/bash
# run_qa_audit.sh - Comprehensive QA Checker

echo "🚀 Starting Full Codebase QA Audit..."
echo "====================================="

OUTPUT_FILE="comprehensive_qa_report.md"
echo "# 🛡️ Comprehensive QA Audit Report" > $OUTPUT_FILE
echo "*Generated on $(date)*" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "## 1. Code Quality & Architecture" >> $OUTPUT_FILE
echo "### Missing User-Facing Errors in Try/Catch" >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
# Look for catch blocks that don't have toast or alert
grep -rn "catch (" Frontend/ERP/components | grep -A 2 "console.error" | grep -v "toast" >> $OUTPUT_FILE || echo "No issues found." >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "## 2. Interactive Elements" >> $OUTPUT_FILE
echo "### Disabled Buttons without cursor-not-allowed" >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
grep -rn "<button" Frontend/ERP/components | grep "disabled" | grep -v "cursor-not-allowed" >> $OUTPUT_FILE || echo "No issues found." >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "## 3. UI & Design System" >> $OUTPUT_FILE
echo "### Hardcoded Magic Numbers (Arbitrary Tailwind Width/Height)" >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
grep -rnE "(w-\[[0-9]+px\]|h-\[[0-9]+px\])" Frontend/ERP/components >> $OUTPUT_FILE || echo "No issues found." >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "## 4. Accessibility (a11y)" >> $OUTPUT_FILE
echo "### Icon-Only Buttons Missing aria-label" >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
grep -rn "<button" Frontend/ERP/components | grep "<i class" | grep -v "aria-label" >> $OUTPUT_FILE || echo "No issues found." >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "## 5. Linter Diagnostics (oxlint)" >> $OUTPUT_FILE
echo '```' >> $OUTPUT_FILE
npx oxlint -D error Frontend >> $OUTPUT_FILE 2>&1
echo '```' >> $OUTPUT_FILE

echo "✅ Audit complete. Results saved to $OUTPUT_FILE"
