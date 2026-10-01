const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/lib/emailtemplate.js', 'utf8');

const oldStyles = `        body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
        .header { background-color: #dc2626; padding: 30px 20px; text-align: center; border-bottom: 3px solid #991b1b; }
        .logo-container { width: 60px; height: 60px; margin: 0 auto 15px auto; }
        .logo-container svg { width: 100%; height: 100%; fill: #ffffff; }
        .header h1 { margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; }
        .header p { margin: 5px 0 0 0; color: #fecaca; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
        .content { padding: 40px 30px; color: #3f3f46; line-height: 1.6; font-size: 15px; }
        .content h2 { color: #18181b; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 600; border-bottom: 1px solid #f4f4f5; padding-bottom: 10px; }
        .footer { background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; color: #a1a1aa; font-size: 11px; letter-spacing: 0.5px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 20px; border: 1px solid #27272a; }
        .data-box { background-color: #fafafa; border-left: 3px solid #dc2626; padding: 15px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }
        .data-row { margin-bottom: 8px; }
        .data-label { font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; display: block; }
        .data-value { font-size: 15px; color: #18181b; font-weight: 500; }`;

const newStyles = `        body { margin: 0; padding: 0; background-color: #F4EFE6; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(93,64,55,0.05); border: 1px solid rgba(93,64,55,0.15); }
        .header { background-color: #5D4037; padding: 30px 20px; text-align: center; border-bottom: 3px solid #3E2723; }
        .logo-container { width: 60px; height: 60px; margin: 0 auto 15px auto; }
        .logo-container svg { width: 100%; height: 100%; fill: #ffffff; }
        .header h1 { margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; }
        .header p { margin: 5px 0 0 0; color: #E8DFD1; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
        .content { padding: 40px 30px; color: #3E2723; line-height: 1.6; font-size: 15px; }
        .content h2 { color: #3E2723; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 600; border-bottom: 1px solid rgba(93,64,55,0.1); padding-bottom: 10px; }
        .footer { background-color: #F4EFE6; padding: 25px 30px; text-align: center; border-top: 1px solid rgba(93,64,55,0.15); }
        .footer p { margin: 0; color: #795548; font-size: 11px; letter-spacing: 0.5px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #5D4037; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 20px; border: 1px solid #3E2723; }
        .data-box { background-color: #F4EFE6; border-left: 3px solid #5D4037; padding: 15px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }
        .data-row { margin-bottom: 8px; }
        .data-label { font-size: 12px; color: #795548; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; display: block; }
        .data-value { font-size: 15px; color: #3E2723; font-weight: 500; }`;

file = file.replace(oldStyles, newStyles);
fs.writeFileSync('Frontend/ERP/lib/emailtemplate.js', file);
