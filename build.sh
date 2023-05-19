set html (minify index.html)
sed "s@{html}@$html@g" payload.js > out.js
