import re

with open('src/ERP/components/Student/Fees/Fees.jsx', 'r') as f:
    content = f.read()

old_inv = """            // 2. Mark invoices as under_verification
            const { error: invError } = await supabase
                .from('fee_invoices')
                .update({ status: 'under_verification' })
                .in('id', selectedFees);
            if (invError) throw invError;"""

new_inv = """            // 2. Mark invoices as under_verification
            const { data: invData, error: invError } = await supabase
                .from('fee_invoices')
                .update({ status: 'under_verification' })
                .in('id', selectedFees)
                .select();
            if (invError) throw invError;
            if (!invData || invData.length === 0) throw new Error("Invoice update blocked by security policies (RLS).");"""

content = content.replace(old_inv, new_inv)

# Let's also move the bank details to be ALWAYS visible!
old_bank = """                        {verificationData.mode === 'NEFT' && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-2 animate-fade-in">"""

new_bank = """                        {/* CAMPUS BANK DETAILS ALWAYS VISIBLE */}
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 animate-fade-in">
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i className="fa-solid fa-building-columns"></i> Campus Bank Details</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-xs"><span className="text-themeTextSec dark:text-white/60 font-medium">Bank Name</span><span className="font-black text-themeText dark:text-white tracking-tight">ICICI Bank</span></div>
                                <div className="flex justify-between text-xs"><span className="text-themeTextSec dark:text-white/60 font-medium">Account Name</span><span className="font-black text-themeText dark:text-white tracking-tight">PRUDENTIA COLLEGE OF LAW</span></div>
                                <div className="flex justify-between text-xs items-center"><span className="text-themeTextSec dark:text-white/60 font-medium">Account No.</span><div className="flex items-center gap-2"><span className="font-mono font-black text-themeText dark:text-white tracking-tight">024305013005</span><button type="button" onClick={() => navigator.clipboard.writeText('024305013005')} className="text-amber-500 hover:text-amber-600"><i className="fa-regular fa-copy"></i></button></div></div>
                                <div className="flex justify-between text-xs items-center"><span className="text-themeTextSec dark:text-white/60 font-medium">IFSC Code</span><div className="flex items-center gap-2"><span className="font-mono font-black text-themeText dark:text-white tracking-tight">ICIC0000243</span><button type="button" onClick={() => navigator.clipboard.writeText('ICIC0000243')} className="text-amber-500 hover:text-amber-600"><i className="fa-regular fa-copy"></i></button></div></div>
                            </div>
                        </div>

                        {verificationData.mode === 'NEFT' && (
                            <div className="hidden">"""
content = content.replace(old_bank, new_bank)

with open('src/ERP/components/Student/Fees/Fees.jsx', 'w') as f:
    f.write(content)
