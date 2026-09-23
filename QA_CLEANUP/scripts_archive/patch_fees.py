import re

with open('src/ERP/components/Student/Fees/Fees.jsx', 'r') as f:
    content = f.read()

old_insert = """            // 1. Record pending transaction
            const { error: txnError } = await supabase.from('fee_transactions').insert({"""
new_insert = """            // 1. Record pending transaction
            const { data: txnData, error: txnError } = await supabase.from('fee_transactions').insert({"""
content = content.replace(old_insert, new_insert)

old_check = """            if (txnError) throw txnError;"""
new_check = """            if (txnError) throw txnError;
            if (!txnData || txnData.length === 0) throw new Error("Transaction blocked by security policies (RLS).");"""
content = content.replace(old_check, new_check)

# Let's check if there is a `.select()` on insert?
# If we want data back, we need `.select()`
content = content.replace("purpose: purposeStr\n            });", "purpose: purposeStr\n            }).select();")

with open('src/ERP/components/Student/Fees/Fees.jsx', 'w') as f:
    f.write(content)
