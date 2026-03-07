const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Fix border:1px solid `${...}` -> border:`1px solid ${...}`
code = code.replace(/([a-zA-Z]+):\s*([0-9a-zA-Z\s.\-]+?)\`(\$\{[^}]+\})\`/g, '$1:`$2$3`');

// Fix border:`1px solid `${G.bdr}`` if any
code = code.replace(/([a-zA-Z]+):\`([0-9a-zA-Z\s.\-]+?)\`(\$\{[^}]+\})\`/g, '$1:`$2$3`');

// Fix any existing linear-gradient(135deg,`${G.deep}`,`${G.green}`)
// Instead of complex regex, let's just find and replace occurrences of: linear-gradient(135deg,`${G.deep}`,`${G.green}`)
code = code.replace(/([a-zA-Z]+):\s*(linear-gradient\([^)]+\))/g, (match, prop, val) => {
    // remove internal backticks if any
    let cleanVal = val.replace(/\`/g, '');
    return prop + ':`' + cleanVal + '`';
});

// Fix unquoted 1px solid without backticks 
code = code.replace(/([a-zA-Z]+):\s*(1px solid \$\{[^}]+\})/g, '$1:`$2`');

// Write back
fs.writeFileSync('src/App.jsx', code);
