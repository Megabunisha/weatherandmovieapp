const fs = require('fs');
const path = require('path');

const dir = __dirname;
const htmlPath = path.join(dir, 'index.html');
const cssPath = path.join(dir, 'style.css');
const jsPath = path.join(dir, 'app.js');

let html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

if (html.includes('<link rel="stylesheet" href="style.css">')) {
  html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>');
}

if (html.includes('<script src="app.js"></script>')) {
  html = html.replace('<script src="app.js"></script>', '<script>\n' + js + '\n</script>');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully bundled standalone index.html. Total bytes:', html.length);
