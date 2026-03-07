const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const styleProps = [
    'background', 'border', 'borderBottom', 'borderTop', 'borderRadius', 
    'padding', 'boxShadow', 'transform', 'filter', 'color', 'animation', 
    'width', 'height', 'left', 'right', 'top', 'bottom', 'text'
];

styleProps.forEach(prop => {
    // Basic values with ${}
    const rx = new RegExp(prop + ':\\s*([^`\'",{}()\\[\\]<>]+?\\$\\{[^}]+\\}[^`\'",{}()\\[\\]<>]*)', 'g');
    code = code.replace(rx, (m, val) => {
        return prop + ':`' + val + '`';
    });
    
    // Values with functions like linear-gradient(...)
    const rx2 = new RegExp(prop + ':\\s*([A-Za-z\\-]+\\([^`\'",{}<>]+?\\$\\{[^}]+\\}[^`\'",{}<>]*\\))', 'g');
    code = code.replace(rx2, (m, val) => {
        return prop + ':`' + val + '`';
    });
});

// Specific replacements based on visual inspection of errors
code = code.replace(/(D\$\{[^}]+\})/g, '`$1`');
code = code.replace(/(₹\$\{[^}]+\}(?:\/kg|\/Q|%|))/g, '`$1`');
code = code.replace(/([▲▼]\$\{[^}]+\}%)/g, '`$1`');
code = code.replace(/(~\$\{[^}]+\}%)/g, '`$1`');
code = code.replace(/(\+\$\{[^}]+\}%)/g, '`$1`');
code = code.replace(/(\-\$\{[^}]+\}%)/g, '`$1`');

code = code.replace(/text:🌾 Namaste \$\{profile\?\.name\?\.split\(" "\)\[0\]\|\|""\}! Ask me about prices, sell timing, best mandi, or weather impact\./, 'text:`🌾 Namaste ${profile?.name?.split(" ")[0]||""}! Ask me about prices, sell timing, best mandi, or weather impact.`');

code = code.replace(/transform=\{rotate\(-90 \$\{cx\} \$\{cy\}\)\}/g, 'transform={`rotate(-90 ${cx} ${cy})`}');
code = code.replace(/background:rgba\(\$\{s\.rgb\},[0-9.]+\)/g, (m) => m.replace(/background:(.+)/, 'background:`$1`'));
code = code.replace(/border:1px solid rgba\(\$\{s\.rgb\},[0-9.]+\)/g, (m) => m.replace(/border:(.+)/, 'border:`$1`'));
code = code.replace(/color:rgb\(\$\{s\.rgb\}\)/g, (m) => m.replace(/color:(.+)/, 'color:`$1`'));
code = code.replace(/rgba\(27,107,53,\$\{([^}]+)\}\)/g, '`rgba(27,107,53,${$1})`');

code = code.replace(/right=\{★ Best: \$\{myMandis\[0\]\?\.split\(" "\)\[0\]\}\}/g, 'right={`★ Best: ${myMandis[0]?.split(" ")[0]}`}');
code = code.replace(/right=\{\$\{[^}]+\}\$\{Math\.abs\([^}]+\)\}%\}/g, (m) => m.replace(/right=\{([^}]+)\}/, 'right={`$1`}'));

code = code.replace(/\{isHold\?\+\$\{cdata\.pct\}% over \$\{days\}d · Wait D\$\{Math\.round\(days\*0\.75\)\}:Drop likely · Sell in 5 days\}/g, '{isHold?`+${cdata.pct}% over ${days}d · Wait D${Math.round(days*0.75)}:Drop likely · Sell in 5 days`:""}');
code = code.replace(/\{isHold\?`\+\$\{cdata\.pct\}% over \$\{days\}d · Wait D\$\{Math\.round\(days\*0\.75\)\}:Drop likely · Sell in 5 days`:""\}/g, '{isHold?`+${cdata.pct}% over ${days}d · Wait D${Math.round(days*0.75)}:Drop likely · Sell in 5 days`:`-`}');

code = code.replace(/\{timer>0\?Resend OTP in \$\{timer\}s:</g, '{timer>0?`Resend OTP in ${timer}s`:<');
code = code.replace(/<span>\{selMandi\|\|Select mandi in \$\{state\}\.\.\.\}<\/span>/g, '<span>{selMandi||`Select mandi in ${state}...`}</span>');

fs.writeFileSync('src/App.jsx.fixed', code);
