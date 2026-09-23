with open('src/ERP/components/Student/Leave/Leave.jsx', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines[:30]):
    print(f"{i}: {line.strip()}")
