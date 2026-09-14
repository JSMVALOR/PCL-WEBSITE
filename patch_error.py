with open('src/ERP/components/Login/OTPVerification.jsx', 'r') as f:
    text = f.read()

text = text.replace(
    "setShowErrorToast('Failed to send OTP. Check backend server.');",
    "setShowErrorToast(`Failed to send OTP: ${err.message || 'Check backend server.'}`);"
)

with open('src/ERP/components/Login/OTPVerification.jsx', 'w') as f:
    f.write(text)

