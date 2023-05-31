
awk 'BEGIN { html = ""; while((getline line < "index.html") > 0) html = html line "\n" } { gsub("{html}", html) } 1' payload.js > build/temp1.js

~/.local/share/nvm/v20.2.0/bin/uglifyjs build/temp1.js > build/temp2.js

cat build/temp2.js | jq -Rsa . | ~/.local/share/nvm/v20.2.0/bin/node -e "const code = require('fs').readFileSync(0, 'utf-8').trim(); const cleanCode = (code) => { return code.replace(/'/g, ''); }; console.log(encodeURIComponent('(function(){' + cleanCode(code) + '})();'));" > build/compiled.txt
