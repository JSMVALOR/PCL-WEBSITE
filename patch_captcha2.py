import re

filepath = 'src/ERP/components/Login/Login.jsx'
with open(filepath, 'r') as f:
    text = f.read()

start_marker = r'<label className="block text-\[10px\] font-black uppercase tracking-\[0\.2em\] text-rose-500 mb-2 ml-1">\s*Security Verification\s*</label>'

new_captcha = r"""<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 ml-1">
                                    Security Verification
                                </label>
                                <div className="flex items-stretch w-full rounded-xl border border-rose-500/40 overflow-hidden focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all bg-[var(--bg-color)] shadow-inner">
                                    <div className="flex items-center justify-center gap-2 bg-rose-500/10 px-6 border-r border-rose-500/30">
                                        <span className="text-xl font-black text-rose-500">{captcha.num1}</span>
                                        <i className="fa-solid fa-plus text-rose-400 text-[10px]"></i>
                                        <span className="text-xl font-black text-rose-500">{captcha.num2}</span>
                                        <i className="fa-solid fa-equals text-rose-400 text-[10px] ml-1"></i>
                                    </div>
                                    <input
                                        type="text"
                                        pattern="\d*"
                                        value={captcha.answer}
                                        onChange={handleCaptchaChange}
                                        className="flex-1 bg-transparent py-4 px-6 text-xl font-black text-[var(--text-color)] outline-none text-center"
                                        placeholder="?"
                                        required
                                    />
                                </div>"""

# Find the start and end of the block to replace
match = re.search(start_marker + r'[\s\S]*?</div>\s*</div>', text)
if match:
    text = text[:match.start()] + new_captcha + '\n                            </div>' + text[match.end():]
    with open(filepath, 'w') as f:
        f.write(text)
    print("Captcha patched")
else:
    print("Could not find block")
