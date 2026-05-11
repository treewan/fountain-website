const puppeteer = require('puppeteer-core');
const path = require('path');

async function generatePDF() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, 'pitchdeck.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  
  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 2000));
  
  // Generate PDF with 16:9 dimensions (1280x720 pixels ≈ 13.33 x 7.5 inches)
  await page.pdf({
    path: path.join(__dirname, 'FOUNTAIN_Pitchdeck.pdf'),
    width: '1280px',
    height: '720px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('PDF generated: FOUNTAIN_Pitchdeck.pdf');
  await browser.close();
}

generatePDF().catch(console.error);
