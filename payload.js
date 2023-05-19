let jsContent = `

alert(1)

`;

async function makeFile(fs, fileName, fileType, content) {
  await new Promise((res) => {
    fs.root.getFile(
      fileName,
      {},
      (fileEntry) => {
        fileEntry.remove(res);
      },
      res
    );
  });
  return await new Promise((res) => {
    fs.root.getFile(fileName, { create: true }, (fileEntry) => {
      fileEntry.createWriter((fileWriter) => {
        fileWriter.write(new Blob([content], { type: fileType }));
        res(fileEntry.toURL());
      });
    });
  });
}

async function onInitFs(fs) {
  let jsFile = await makeFile(fs, "test.js", "text/javascript", jsContent);

  let htmlContent = `{html}`;
  let htmlFile = await makeFile(fs, "test.html", "text/html", htmlContent);

  prompt("Your finished persistence URL:", htmlFile);
}

webkitRequestFileSystem(window.TEMPORARY, jsContent.length + 33, onInitFs);
