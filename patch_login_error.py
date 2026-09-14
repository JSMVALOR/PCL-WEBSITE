with open('src/ERP/components/Login/Login.jsx', 'r') as f:
    text = f.read()

text = text.replace(
    "setErrorMsg('Unable to connect to the authentication server. Please try again later.');",
    "setErrorMsg(`Auth Connection Error: ${error.message || 'Please try again later.'}`);"
)

with open('src/ERP/components/Login/Login.jsx', 'w') as f:
    f.write(text)

