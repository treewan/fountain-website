const puppeteer = require('puppeteer-core');
const path = require('path');

async function generatePDF() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const htmlPath = path.join(__dirname, 'pitchdeck-light.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.pdf({
    path: path.join(__dirname, 'FOUNTAIN_Pitchdeck_Light.pdf'),
    width: '1280px',
    height: '720px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('PDF generated: FOUNTAIN_Pitchdeck_Light.pdf');
  await browser.close();
}

generatePDF().catch(console.error);
