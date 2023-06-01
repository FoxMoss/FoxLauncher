
awk 'BEGIN { html = ""; while((getline line < "payload.html") > 0) html = html line "\n" } { gsub("{html}", html) } 1' loader.js > build/temp1.js

~/.local/share/nvm/v20.2.0/bin/uglifyjs build/temp1.js > build/temp2.js

cat build/temp2.js | ~/.local/share/nvm/v20.2.0/bin/node -e "const code = require('fs').readFileSync(0, 'utf-8').trim(); console.log(encodeURIComponent('(function(){' + code + '})();'));" > build/compiled.txt


cat build/compiled.txt | ~/.local/share/nvm/v20.2.0/bin/node -e "const code = require('fs').readFileSync(0, 'utf-8').trim(); console.log(encodeURIComponent('(function(){' + code + '})();'));" > build/encodedc.txt

cp -R res/* web/docs/assets/res/

cd web && mkdocs build && cd ../

zip -r build/foxlauncherdocs.zip web/site/*

rm build/temp1.js
rm build/temp2.js