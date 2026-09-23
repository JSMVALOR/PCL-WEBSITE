import re

with open('src/ERP/components/Student/Approvals/StudentApprovals.jsx', 'r') as f:
    content = f.read()

# 1. Change activeTab default
content = content.replace('const [activeTab, setActiveTab] = useState("leaves"); // \'leaves\' or \'grievances\'', 'const [activeTab, setActiveTab] = useState("grievances");')

# 2. Remove Toggle Tabs UI
tabs_ui = r"""<div className="flex bg-black/5 dark:bg-white/5 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-1\.5 rounded-xl self-start">.*?</div>"""
content = re.sub(tabs_ui, '', content, flags=re.DOTALL)

# 3. Change Right Pane Title
content = content.replace("{activeTab === 'leaves' ? 'Leave History' : 'Grievance History'}", "'Grievance History'")

# 4. Remove the `activeTab === 'leaves'` condition blocks
# Since it's quite complex to regex out JSX blocks, I will replace the conditional rendering:
content = content.replace("activeTab === 'leaves'", "false")
content = content.replace("activeTab === 'grievances'", "true")

# Actually, I'll just leave `activeTab` as 'grievances' permanently, the `false ? ... : ...` will cause React to just ignore the Leaves part. But it's cleaner to remove it.
# Let's just do a string replacement for the Tabs header.
content = content.replace('title="My Approvals"', 'title="Grievance Cell"')
content = content.replace('subtitle="Track your leave requests and disciplinary grievances"', 'subtitle="Report and track disciplinary and academic grievances"')

with open('src/ERP/components/Student/Approvals/StudentApprovals.jsx', 'w') as f:
    f.write(content)
