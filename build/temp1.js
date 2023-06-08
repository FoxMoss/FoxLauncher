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
  let htmlFile = await makeFile(fs, "index.html", "text/html", `<!doctype html><html lang=en><meta charset=utf-8><meta http-equiv=x-ua-compatible content="IE=edge"><meta name=viewport content="width=device-width,initial-scale=1"><title>FoxLauncher</title><script src=zip.js></script>
<script src=./payload.js></script>
<link rel=stylesheet href=payload.css><div class=content><div class=border><h1>FoxLauncher</h1><div class=textcontent>Made by <a href=https://foxmoss.com/personal/>foxmoss</a> from
<a href=mailto:foxmoss@mediaology.com>foxmoss@mediaology.com</a>.<br>Read the documentation at <a href=https://foxmoss.com/foxlauncher>foxmoss.com/foxlauncher</a></div><div><label class="resourcesFileUpload upload zipinst"><input type=file id=resourcesFileInput>
Upload .flr</label>
<button id=flr class=zipinst>Upload the zip.flr file!</button></div><label class="zipFileUpload upload zip" disabled><input type=file id=zipFileInput class=zip disabled>
Upload .flz</label>
<button id=flz class=zip disabled>Load a .flz file!</button><h3>Game Bookmarks:</h3><ul id=fileList></ul><h3>Permissions:</h3><ul id=permList></ul></div></div>
`);
  await makeFile(fs, "payload.js", "text/js", `{js}`);
  await makeFile(fs, "payload.css", "text/js", `{css}`);

  prompt("Your finished persistence URL:", htmlFile);
}

webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs);
