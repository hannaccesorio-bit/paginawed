const h = require('http');
const f = require('fs');
const p = require('path');
const extMap = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json'
};
h.createServer((q, r) => {
    let url = q.url === '/' ? '/index.html' : q.url.split('?')[0];
    let file = p.join(__dirname, url);
    try {
        if (!f.existsSync(file) || f.statSync(file).isDirectory()) {
            r.writeHead(404); r.end('404');
            return;
        }
        let ext = p.extname(file).toLowerCase();
        let c = f.readFileSync(file);
        r.writeHead(200, { 'Content-Type': extMap[ext] || 'text/plain' });
        r.end(c);
    } catch (e) {
        r.writeHead(500);
        r.end('Error: ' + e.message);
    }
}).listen(8080, () => console.log('Server running on http://localhost:8080'));
