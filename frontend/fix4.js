const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(/border:1px solid `(\$\{[^}]+\})`/g, 'border:`1px solid $1`');
c = c.replace(/borderBottom:1px solid `(\$\{[^}]+\})`/g, 'borderBottom:`1px solid $1`');
c = c.replace(/borderTop:1px solid `(\$\{[^}]+\})`/g, 'borderTop:`1px solid $1`');
c = c.replace(/borderLeft:1px solid `(\$\{[^}]+\})`/g, 'borderLeft:`1px solid $1`');
c = c.replace(/borderRight:1px solid `(\$\{[^}]+\})`/g, 'borderRight:`1px solid $1`');

c = c.replace(/border:1\.5px solid `(\$\{[^}]+\})`/g, 'border:`1.5px solid $1`');
c = c.replace(/border:2px solid `(\$\{[^}]+\})`/g, 'border:`2px solid $1`');
c = c.replace(/borderBottom:2px solid `(\$\{[^}]+\})`/g, 'borderBottom:`2px solid $1`');

c = c.replace(/border:`1\.5px solid \$\{v \? G\.green : G\.bdr\}`/g, 'border:`1.5px solid ${v ? G.green : G.bdr}`');
c = c.replace(/border:`1px solid \$\{mandiOpen\?G\.green:G\.bdr\}`/g, 'border:`1px solid ${mandiOpen?G.green:G.bdr}`');
c = c.replace(/borderBottom:`1px solid \$\{i<mandis\.length-1\?1px solid \$\{G\.faint\}:"none"\}`/g, 'borderBottom: i<mandis.length-1?`1px solid ${G.faint}`:"none"');

c = c.replace(/1px solid `\$\{G\.bdr\}`/g, '`1px solid ${G.bdr}`');
c = c.replace(/1px solid `\$\{G\.faint\}`/g, '`1px solid ${G.faint}`');
c = c.replace(/1px solid `\$\{G\.green\}`/g, '`1px solid ${G.green}`');

c = c.replace(/background:linear-gradient\([^)]+\)/g, (match) => {
    let inner = match.substring('background:'.length);
    inner = inner.replace(/`/g, '');
    return 'background:`' + inner + '`';
});

// fix `borderBottom:qpOpen?1px solid ${G.faint}:1px solid ${G.bdr}` which might have backticks around G.bdr
c = c.replace(/qpOpen\?`1px solid \$\{G\.faint\}`:1px solid `\$\{G\.bdr\}`/g, 'qpOpen?`1px solid ${G.faint}`:`1px solid ${G.bdr}`');
c = c.replace(/i<mandis\.length-1\?`1px solid \$\{G\.faint\}`:"none"/g, 'i<mandis.length-1?`1px solid ${G.faint}`:"none"');
c = c.replace(/!qpOpen\?`1px solid \$\{G\.faint\}`:1px solid `\$\{G\.bdr\}`/g, '!qpOpen?`1px solid ${G.faint}`:`1px solid ${G.bdr}`');

fs.writeFileSync('src/App.jsx.fixed', c);
