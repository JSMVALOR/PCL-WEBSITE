path = 'src/ERP/components/Student/Credentials/Credentials.jsx'
with open(path, 'r') as f:
    c = f.read()

c = c.replace("import { useERP }", "import IDCardTemplate from '../../../DocumentTemplates/IDCardTemplate';\nimport { useERP }")

with open(path, 'w') as f:
    f.write(c)
