const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const root = path.resolve(__dirname, '..');
  // gather all html files in workspace root and subfolders (exclude node_modules, backend)
  function gatherHtml(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === 'backend' || e.name === '.git') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) results = results.concat(gatherHtml(full));
      else if (e.isFile() && e.name.endsWith('.html')) results.push(full);
    }
    return results;
  }

  const htmlFiles = gatherHtml(root).map(f => path.relative(root, f));
  console.log('Discovered', htmlFiles.length, 'HTML files');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const report = [];

  for (const rel of htmlFiles) {
    const urlPath = rel.replace(/\\/g, '/');
    const url = `http://127.0.0.1:3000/${urlPath}`;
    const page = await context.newPage();
    const pageReport = { url, console: [], errors: [], responses: [] };

    page.on('console', msg => {
      pageReport.console.push({type: msg.type(), text: msg.text()});
    });
    page.on('pageerror', err => {
      pageReport.errors.push({message: err.message, stack: err.stack});
    });
    page.on('response', resp => {
      if (resp.status() === 404) pageReport.responses.push({url: resp.url(), status: resp.status()});
    });

    try {
      await page.goto(url, { waitUntil: 'load', timeout: 15000 });
      // scroll slowly
      await page.evaluate(async () => {
        await new Promise(res => {
          let total = 0; const step = 200; const h = document.body.scrollHeight;
          const iv = setInterval(() => { window.scrollBy(0, step); total += step; if (total >= h) { clearInterval(iv); res(); } }, 100);
        });
      });

      // click buttons and anchors
      const anchors = await page.$$eval('a[href]', els => els.map(e => ({href: e.getAttribute('href'), text: e.textContent, selector: e.outerHTML})).slice(0,50));
      for (const a of anchors) {
        try {
          // avoid external links
          if (a.href.startsWith('http') && !a.href.includes('127.0.0.1') && !a.href.includes('localhost')) continue;
          // try to click by text
          const handle = await page.$(`a[href="${a.href}"]`);
          if (handle) {
            await handle.scrollIntoViewIfNeeded();
            await handle.click({ timeout: 5000 }).catch(()=>{});
            await page.waitForTimeout(500);
            // go back if navigation happened
            if (page.url() !== url) await page.goBack({ waitUntil: 'domcontentloaded' }).catch(()=>{});
          }
        } catch (err) {}
      }

      // fill simple inputs
      const inputs = await page.$$('[type="text"],[type="email"],textarea');
      for (let i=0;i<inputs.length;i++){
        try { await inputs[i].fill('test'); } catch (e) {}
      }

      // submit forms
      const forms = await page.$$('form');
      for (const f of forms) {
        try { await f.evaluate(form => form.submit()); await page.waitForTimeout(500); await page.goBack().catch(()=>{}); } catch (e) {}
      }

    } catch (err) {
      pageReport.errors.push({message: err.message, stack: err.stack});
    }

    report.push(pageReport);
    await page.close();
  }

  await browser.close();

  const out = {
    meta: { generatedAt: new Date().toISOString(), scanned: htmlFiles.length },
    pages: report
  };
  fs.writeFileSync(path.join(root, 'workspace_audit_raw.json'), JSON.stringify(out, null, 2));
  console.log('Sweep complete. Raw report written to workspace_audit_raw.json');
})();
