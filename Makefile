
ifeq ($(DEBUG), 0)
all:	compile clean serve
else
all:	compile package clean
endif


compile:
	awk 'BEGIN { html = ""; while((getline line < "payload.html") > 0) html = html line "\n" } { gsub("{html}", html) } 1' loader.js > build/temp1.js

	awk 'BEGIN { js = ""; while((getline line < "payload.js") > 0) js = js line "\n" } { gsub("{js}", js) } 1' build/temp1.js > build/temp2.js

	~/.local/share/nvm/v20.2.0/bin/uglifyjs build/temp2.js > build/temp3.js

	cat build/temp3.js | ~/.local/share/nvm/v20.2.0/bin/node -e "const code = require('fs').readFileSync(0, 'utf-8').trim(); console.log(encodeURIComponent('(function(){' + code + '})();'));" > build/compiled.txt

	cat build/compiled.txt | ~/.local/share/nvm/v20.2.0/bin/node -e "const code = require('fs').readFileSync(0, 'utf-8').trim(); console.log(encodeURIComponent('(function(){' + code + '})();'));" > build/encodedc.txt

	cp -R res/* web/docs/assets/res/

package:
	cd web && mkdocs build && cd ../

	zip -r build/foxlauncherdocs.zip web/site/*

serve:
	cd web && mkdocs serve && cd ../

clean:
	rm build/temp1.js

	rm build/temp2.js

	rm build/temp3.js