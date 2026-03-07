const fs = require('fs');
let C = fs.readFileSync('src/App.jsx', 'utf8');

// Styles missing backticks
C = C.replace(/([a-zA-Z]+):(1px solid \$\{[^}]+\})/g, '$1:`$2`');
C = C.replace(/([a-zA-Z]+):(1\.5px solid \$\{[^}]+\})/g, '$1:`$2`');
C = C.replace(/([a-zA-Z]+):(2px solid \$\{[^}]+\})/g, '$1:`$2`');
C = C.replace(/([a-zA-Z]+):(2\.5px solid \$\{[^}]+\})/g, '$1:`$2`');
C = C.replace(/([a-zA-Z]+):(linear-gradient\([^)]+\))/g, '$1:`$2`');
C = C.replace(/([a-zA-Z]+):(rgba\([^)]+\))/g, '$1:`$2`');
C = C.replace(/([a-zA-Z]+):(rgb\([^)]+\))/g, '$1:`$2`');

// Conditionals missing backticks
C = C.replace(/borderBottom:qpOpen\?1px solid \$\{G\.faint\}:1px solid \$\{G\.bdr\}/g, 'borderBottom:qpOpen?`1px solid ${G.faint}`:`1px solid ${G.bdr}`');
C = C.replace(/borderBottom:i<mandis\.length-1\?1px solid \$\{G\.faint\}:"none"/g, 'borderBottom:i<mandis.length-1?`1px solid ${G.faint}`:"none"');

C = C.replace(/\{isHold\?\+\$\{cdata\.pct\}% over \$\{days\}d · Wait D\$\{Math\.round\(days\*0\.75\)\}:Drop likely · Sell in 5 days\}/g, '{isHold?`+${cdata.pct}% over ${days}d · Wait D${Math.round(days*0.75)}:Drop likely · Sell in 5 days`:""}');
C = C.replace(/text:🌾 Namaste \$\{profile\?\.name\?\.split\(" "\)\[0\]\|\|""\}! Ask me about prices, sell timing, best mandi, or weather impact\./, 'text:`🌾 Namaste ${profile?.name?.split(" ")[0]||""}! Ask me about prices, sell timing, best mandi, or weather impact.`');
C = C.replace(/transform=\{rotate\(-90 \$\{cx\} \$\{cy\}\)\}/g, 'transform={`rotate(-90 ${cx} ${cy})`}');
C = C.replace(/\{selMandi\|\|Select mandi in \$\{state\}\.\.\.\}/g, '{selMandi||`Select mandi in ${state}...`}');
C = C.replace(/right=\{★ Best: \$\{([^}]+)\}\}/g, 'right={`★ Best: ${$1}`}');
C = C.replace(/right=\{\$\{([^}]+)\}\$\{([^}]+)\}%\}/g, 'right={`${$1}${$2}%`}');
C = C.replace(/\{timer>0\?Resend OTP in \$\{timer\}s:</g, '{timer>0?`Resend OTP in ${timer}s`:<');

// Standalone interpolated words missing backticks (D${...}, ₹${...}, etc)
C = C.replace(/(?<!`)D\$\{([^}]+)\}(?!`)/g, '`D${$1}`');
C = C.replace(/(?<!`)₹\$\{([^}]+)\}\/kg(?!`)/g, '`₹${$1}/kg`');
C = C.replace(/(?<!`)₹\$\{([^}]+)\}\/Q(?!`)/g, '`₹${$1}/Q`');
C = C.replace(/(?<!`)₹\$\{([^}]+)\}(?!`)/g, '`₹${$1}`');
C = C.replace(/(?<!`)▲\$\{([^}]+)\}%(?!`)/g, '`▲${$1}%`');
C = C.replace(/(?<!`)▼\$\{([^}]+)\}%(?!`)/g, '`▼${$1}%`');
C = C.replace(/(?<!`)~\$\{([^}]+)\}%(?!`)/g, '`~${$1}%`');
C = C.replace(/(?<!`)\+\$\{([^}]+)\}%(?!`)/g, '`+${$1}%`');

fs.writeFileSync('src/App.jsx.fixed', C);
