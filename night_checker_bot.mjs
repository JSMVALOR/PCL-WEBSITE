import puppeteer from 'puppeteer';

(async () => {
    console.log("🚀 Initializing Night Checker Headless Bot...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox'] 
    });
    
    const page = await browser.newPage();
    
    const errors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    page.on('requestfailed', request => {
        errors.push(`Network Failure: ${request.url()} - ${request.failure().errorText}`);
    });

    console.log("🌐 Navigating to ERP Application...");
    
    const routesToTest = [
        'http://localhost:10001/',
        'http://localhost:10001/login',
        'http://localhost:10001/admin/dashboard',
        'http://localhost:10001/admin/notices',
        'http://localhost:10001/faculty/dashboard'
    ];

    for (let i = 0; i < routesToTest.length; i++) {
        const route = routesToTest[i];
        console.log(`\n🔍 Scanning Route: ${route}`);
        try {
            await page.goto(route, { waitUntil: 'networkidle2', timeout: 15000 });
            console.log("✅ Rendered successfully.");
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.log(`❌ Timeout or Error on ${route}`);
            errors.push(`Failed to load ${route}: ${e.message}`);
        }
    }

    console.log("\n==========================================");
    console.log("🎯 NIGHT CHECKER AUDIT COMPLETE");
    console.log("==========================================");
    
    if (errors.length > 0) {
        console.log(`\n⚠️ FOUND ${errors.length} ERRORS/CRASHES:`);
        const criticalErrors = errors.filter(e => !e.includes('401') && !e.includes('403') && !e.includes('Failed to load resource: net::ERR_CONNECTION_REFUSED'));
        [...new Set(criticalErrors)].forEach(err => console.log(`- ${err}`));
        
        if (criticalErrors.length === 0) console.log("✅ ZERO CRITICAL UI CRASHES DETECTED.");
    } else {
        console.log("\n✅ ZERO UI CRASHES DETECTED.");
    }
    
    await browser.close();
})();
