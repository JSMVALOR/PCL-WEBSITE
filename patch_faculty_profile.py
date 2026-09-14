import re

filepath = 'src/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx'
with open(filepath, 'r') as f:
    text = f.read()

# 1. Update the left column wrapper to be smaller on desktop (w-4/12) and centered on mobile
text = text.replace(
    'className="w-full lg:w-5/12 shrink-0 flex flex-col lg:sticky lg:top-32"',
    'className="w-full max-w-md mx-auto lg:max-w-none lg:w-4/12 shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left lg:sticky lg:top-32"'
)

# 2. Update the back button to not be centered weirdly if flex-col items-center
text = text.replace(
    '<Link\n            to="/about/faculty"\n            className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-8 uppercase tracking-widest text-xs font-bold focus:outline-none w-max"\n          >',
    '<Link\n            to="/about/faculty"\n            className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-8 uppercase tracking-widest text-xs font-bold focus:outline-none w-max self-start"\n          >'
)

# 3. Update the image wrapper and the img tag to remove grayscale and shrink
old_img = """<motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full aspect-[4/5] relative rounded-sm overflow-hidden mb-8 bg-black/20"
          >
            <img decoding="async" loading="lazy" 
              src={faculty.image} 
              alt={faculty.name} 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 transition-all duration-700 hover:grayscale-0 hover:scale-105" 
            />
          </motion.div>"""

new_img = """<motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-4/5 md:w-3/4 lg:w-full max-w-[320px] aspect-[4/5] relative rounded-3xl overflow-hidden mb-8 bg-black/5 shadow-2xl border border-[var(--card-border)]"
          >
            <img decoding="async" loading="lazy" 
              src={faculty.image} 
              alt={faculty.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
            />
          </motion.div>"""

text = text.replace(old_img, new_img)

# 4. Make the social links centered on mobile
text = text.replace(
    'className="flex flex-col gap-4"',
    'className="flex flex-col gap-4 items-center lg:items-start w-full"'
)
text = text.replace(
    '<div className="flex gap-4 mt-4">',
    '<div className="flex justify-center lg:justify-start gap-4 mt-4">'
)

with open(filepath, 'w') as f:
    f.write(text)
print("Faculty Profile Patched")
