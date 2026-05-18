import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message, error.stack));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  setTimeout(async () => {
    await browser.close();
  }, 2000);
})();
