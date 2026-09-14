import fetch from 'node-fetch'

async function testVercel() {
  console.log("Hitting Vercel API...")
  
  try {
    const res = await fetch('https://prudentiacollege.edu/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: 'contact.jsminnovation@gmail.com',
        subject: 'Vercel API Test',
        message_body: '<h1>Vercel is working!</h1>'
      })
    })

    const text = await res.text()
    console.log("Vercel Response:", res.status, text)
  } catch (err) {
    console.error("Fetch failed:", err)
  }
}

testVercel()
