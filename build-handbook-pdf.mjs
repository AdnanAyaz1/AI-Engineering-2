import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { marked } from 'marked';

async function buildHandbook() {
  console.log('1. Reading handbook source chapters...');
  const srcDir = path.join(process.cwd(), 'handbook-src');
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md')).sort();

  let combinedMarkdown = '';
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    combinedMarkdown += content.trim() + '\n\n---\n\n';
  }

  // Save the complete Markdown source
  const mdPath = path.join(process.cwd(), 'rag-testing-document.md');
  fs.writeFileSync(mdPath, combinedMarkdown, 'utf8');
  console.log(`Saved full Markdown source: ${mdPath}`);

  // Count words
  const words = combinedMarkdown.trim().split(/\s+/).length;
  console.log(`Total Word Count in Markdown: ${words.toLocaleString()} words`);

  // Parse Markdown to HTML
  console.log('2. Rendering Markdown to styled HTML...');
  const bodyHtml = marked.parse(combinedMarkdown);

  // Wrap in professional print-optimized HTML and CSS
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Enterprise Software Engineering and Technical Operations Handbook</title>
<style>
  @page {
    size: letter;
    margin: 13mm 12mm 13mm 12mm;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 8.8pt;
    line-height: 1.32;
    color: #1e293b;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
  }

  /* Cover Page */
  .cover-container {
    page-break-after: always;
    padding-top: 30px;
    padding-bottom: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 80vh;
  }

  .cover-badge {
    display: inline-block;
    padding: 4px 10px;
    background-color: #0f172a;
    color: #38bdf8;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    border-radius: 4px;
    margin-bottom: 14px;
  }

  .cover-title {
    font-size: 22pt;
    font-weight: 800;
    line-height: 1.15;
    color: #0f172a;
    margin: 0 0 10px 0;
    border-bottom: 3px solid #0284c7;
    padding-bottom: 12px;
  }

  .cover-subtitle {
    font-size: 10.5pt;
    line-height: 1.3;
    color: #475569;
    margin-bottom: 18px;
    font-weight: 400;
  }

  /* Headings & Structure */
  h1 {
    font-size: 15pt;
    font-weight: 800;
    color: #0f172a;
    margin-top: 18px;
    margin-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
  }

  /* Force major chapter titles to start on new page */
  h1:not(:first-of-type) {
    page-break-before: always;
    break-before: always;
  }

  h2 {
    font-size: 11.5pt;
    font-weight: 700;
    color: #0369a1;
    margin-top: 13px;
    margin-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h3 {
    font-size: 9.8pt;
    font-weight: 600;
    color: #1e293b;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
  }

  p {
    margin-top: 0;
    margin-bottom: 6px;
    text-align: justify;
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 6px;
    padding-left: 18px;
  }

  li {
    margin-bottom: 2px;
  }

  /* Code Blocks */
  pre {
    background-color: #0f172a;
    color: #f1f5f9;
    border: 1px solid #1e293b;
    border-radius: 4px;
    padding: 6px 9px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    font-size: 6.8pt;
    line-height: 1.25;
    overflow-x: auto;
    margin: 6px 0 8px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    font-size: 7.4pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1px 3px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }

  pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
    font-size: 6.8pt;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 10px 0;
    font-size: 7.3pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
  }

  td {
    padding: 4px 7px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  /* Blockquotes / Callout Boxes */
  blockquote {
    margin: 8px 0;
    padding: 6px 10px;
    background-color: #f0f9ff;
    border-left: 3px solid #0284c7;
    color: #0c4a6e;
    border-radius: 0 4px 4px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  blockquote p {
    margin: 0;
  }

  blockquote strong {
    color: #0369a1;
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 12px 0;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  const htmlPath = path.join(process.cwd(), 'rag-testing-document.html');
  fs.writeFileSync(htmlPath, fullHtml, 'utf8');
  console.log(`Saved intermediate HTML: ${htmlPath}`);

  // 3. Render PDF via Chrome Headless and CDP
  console.log('3. Launching Chrome headless for PDF generation...');
  const tmpDir = path.join(process.cwd(), '.chrome-pdf-runner');
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--user-data-dir=' + tmpDir,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  let portFile = path.join(tmpDir, 'DevToolsActivePort');
  while (!fs.existsSync(portFile)) {
    await new Promise(r => setTimeout(r, 100));
  }
  const lines = fs.readFileSync(portFile, 'utf8').trim().split('\n');
  const port = lines[0].trim();
  console.log(`Connected to Chrome DevTools port: ${port}`);

  const res = await fetch(`http://127.0.0.1:${port}/json/version`);
  const ver = await res.json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);

  await new Promise(resolve => ws.onopen = resolve);

  let idCounter = 1;
  function sendCdp(method, params = {}) {
    return new Promise(resolve => {
      const curId = idCounter++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  const { targetId } = await sendCdp('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await sendCdp('Target.attachToTarget', { targetId, flatten: true });

  function sendSession(method, params = {}) {
    return new Promise(resolve => {
      const curId = idCounter++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, sessionId, method, params }));
    });
  }

  await sendSession('Page.enable');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log(`Navigating to ${fileUrl}...`);
  await sendSession('Page.navigate', { url: fileUrl });

  // Wait for rendering and layout to settle
  await new Promise(r => setTimeout(r, 2000));

  console.log('Printing to PDF with high-fidelity headers and footers...');
  const headerHtml = `
    <div style="font-size: 7.5pt; width: 100%; display: flex; justify-content: space-between; padding: 0 35px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
      <span style="font-weight: 500;">Enterprise Software Engineering and Technical Operations Handbook</span>
      <span style="font-weight: 700; letter-spacing: 0.5px; color: #0f172a;">TECHNICAL REFERENCE MANUAL • CONFIDENTIAL</span>
    </div>
  `;

  const footerHtml = `
    <div style="font-size: 7.5pt; width: 100%; display: flex; justify-content: space-between; padding: 0 35px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-top: 1px solid #e2e8f0; padding-top: 4px;">
      <span>Document Rev 4.2.0 • Architecture & Reliability Councils</span>
      <span style="font-weight: 600;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;

  const pdfData = await sendSession('Page.printToPDF', {
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: headerHtml,
    footerTemplate: footerHtml,
    marginTop: 0.6,
    marginBottom: 0.6,
    marginLeft: 0.5,
    marginRight: 0.5,
    preferCSSPageSize: true
  });

  const pdfBuffer = Buffer.from(pdfData.data, 'base64');
  const pdfPath = path.join(process.cwd(), 'rag-testing-document.pdf');
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log(`Successfully generated PDF: ${pdfPath}`);
  console.log(`PDF File Size: ${(pdfBuffer.length / (1024 * 1024)).toFixed(2)} MB`);

  chrome.kill();

  // Clean up intermediate temp directory after a brief delay
  setTimeout(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }, 1000);

  // 4. Verification with unpdf
  console.log('4. Verifying generated PDF with unpdf...');
  const { extractText } = await import('unpdf');
  const result = await extractText(pdfBuffer);
  console.log(`Total Pages in Generated PDF: ${result.totalPages}`);
  console.log(`Total Extracted Text Length: ${result.text.join(' ').length} characters`);
  console.log(`Verification Complete!`);
}

buildHandbook().catch(console.error);
