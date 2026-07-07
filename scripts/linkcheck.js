const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
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

const htmlFiles = gatherHtml(root);
const report = [];
for (const f of htmlFiles) {
  const content = fs.readFileSync(f,'utf8');
  const dir = path.dirname(f);
  const assets = [];
  const regex = /(?:src|href)=(?:"|')([^"'>]+)(?:"|')/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const ref = m[1];
    if (ref.startsWith('http') || ref.startsWith('//')) continue;
    // normalize
    const refPath = path.resolve(dir, ref.split('?')[0].split('#')[0]);
    const exists = fs.existsSync(refPath);
    assets.push({ref, resolved: path.relative(root, refPath), exists});
  }
  report.push({file: path.relative(root,f), assets});
}
fs.writeFileSync(path.join(root,'workspace_link_report.json'), JSON.stringify({generatedAt: new Date().toISOString(), report}, null, 2));
console.log('Link report written to workspace_link_report.json');
