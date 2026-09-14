import re

filepath = 'src/ERP/components/Login/Login.jsx'
with open(filepath, 'r') as f:
    text = f.read()

old_captcha = r'<div className="flex items-center gap-4">[\s\S]*?</label>\s*<div className="flex items-center gap-4">[\s\S]*?<div className="bg-\[var\(--bg-color\)\] border border-rose-500/30 rounded-lg px-4 py-3 flex items-center justify-center gap-3 w-1/2">[\s\S]*?<span className="text-lg font-black text-\[var\(--text-color\)\]">\{captcha\.num1\}</span>[\s\S]*?<i className="fa-solid fa-plus text-\[var\(--text-muted\)\] text-xs"></i>[\s\S]*?<span className="text-lg font-black text-\[var\(--text-color\)\]">\{captcha\.num2\}</span>[\s\S]*?</div>[\s\S]*?<input[\s\S]*?className="w-1/2 bg-\[var\(--bg-color\)\] border border-rose-500/30 focus:border-rose-500 rounded-lg py-3 px-5 text-lg font-bold text-\[var\(--text-color\)\] outline-none transition text-center"[\s\S]*?placeholder="="[\s\S]*?required[\s\S]*?/>[\s\S]*?</div>'

# We will just replace the inner div of the captcha
start_marker = r'<label className="block text-\[10px\] font-black uppercase tracking-\[0\.2em\] text-rose-500 mb-2 ml-1">\s*Security Verification\s*</label>'

new_captcha = """<label className="block text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 ml-1">
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
                                        pattern="\\d*"
                                        value={captcha.answer}
                                        onChange={handleCaptchaChange}
                                        className="flex-1 bg-transparent py-4 px-6 text-xl font-black text-[var(--text-color)] outline-none text-center"
                                        placeholder="?"
                                        required
                                    />
                                </div>"""

text = re.sub(start_marker + r'[\s\S]*?</div>\s*</div>', new_captcha + '\n                            </div>', text)

with open(filepath, 'w') as f:
    f.write(text)

print("Captcha patched")
