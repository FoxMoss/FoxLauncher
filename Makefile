ifeq ($(DEBUG), 1)
all:	test
else ifeq ($(DEBUG), 2)
all:	compile clean serve
else
all:	compile package clean
endif

test:
	cp res/zip.flr ./zip.js
	php -S localhost:8080

compile:
	minify payload.html > build/minifed.html

	minify payload.css > build/minifed.css

	~/.local/share/nvm/v20.2.0/bin/uglifyjs payload.js > build/minifed.js

	awk 'BEGIN { html = ""; while((getline line < "build/minifed.html") > 0) html = html line "\n" } { gsub("{html}", html) } 1' loader.js > build/temp1.js

	awk 'BEGIN { js = ""; while((getline line < "build/minifed.js") > 0) js = js line "\n" } { gsub("{js}", js) } 1' build/temp1.js > build/temp2.js

	awk 'BEGIN { css = ""; while((getline line < "build/minifed.css") > 0) css = css line "\n" } { gsub("{css}", css) } 1' build/temp2.js > build/temp25.js

	~/.local/share/nvm/v20.2.0/bin/uglifyjs build/temp25.js > build/temp3.js

	cat build/temp3.js | ~/.local/share/nvm/v20.2.0/bin/node -e "const code = require('fs').readFileSync(0, 'utf-8').trim(); console.log(encodeURIComponent('(function(){' + code + '})();'));" > build/compiled.txt

	cat build/compiled.txt | ~/.local/share/nvm/v20.2.0/bin/node -e "const code = require('fs').readFileSync(0, 'utf-8').trim(); console.log(encodeURIComponent('(function(){' + code + '})();'));" > build/encodedc.txt

	cp -R res/* web/docs/assets/res/

package:
	cd web && mkdocs build && cd ../

	zip -r build/foxlauncherdocs.zip web/site/*

serve:
	cd web && mkdocs serve && cd ../

clean:
ifeq ($(CLEAN), 0)
	echo "no clean"
else
	rm build/temp1.js
	rm build/temp2.js
	rm build/temp25.js
	rm build/temp3.js

	rm build/minifed.js
	rm build/minifed.css
	rm build/minifed.html

endif