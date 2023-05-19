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

  let htmlContent = `<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>FoxLoader</title> </head> <body> <label for="fileupload" id="instructions">Upload zip.rfl</label> <input type="file" name="fileupload" id="fileupload"/> <div>Made by foxmoss</div><script>var fs; window.requestFileSystem=window.requestFileSystem || window.webkitRequestFileSystem; window.requestFileSystem( window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler ); const instructionEL=document.querySelector("#instructions"); const uploadEL=document.querySelector("#fileupload"); uploadEL.addEventListener("change", uploadFile); var stage=0; function onInitFs(tempFs){fs=tempFs; if (checkFileExists("zip.js")){stage++; instructionEL.innerText="Upload any .zfl file!"; var scriptElement=document.createElement("script"); scriptElement.src="./zip.js"; document.head.appendChild(scriptElement);}}function checkFileExists(filePath){return new Promise(function (resolve){fs.root.getFile( filePath,{create: false}, function (fileEntry){resolve(true);}, function (error){resolve(false);});});}async function makeFile(fs, fileName, fileType, content){await new Promise((res)=>{fs.root.getFile( fileName,{}, (fileEntry)=>{fileEntry.remove(res);}, res );}); return await new Promise((res)=>{fs.root.getFile(fileName,{create: true}, (fileEntry)=>{fileEntry.createWriter((fileWriter)=>{fileWriter.write(new Blob([content],{type: fileType})); res(fileEntry.toURL());});});});}function uploadFile(){if (stage==0){const file=document.querySelector("#fileupload").files[0]; makeFile(fs, "zip.js", "text/javascript", file); instructionEL.innerText="Upload any .zfl file!"; var scriptElement=document.createElement("script"); scriptElement.src="./zip.js"; document.head.appendChild(scriptElement);}}function errorHandler(err){console.error("File System Error:", err);}</script> </body></html>`;
  let htmlFile = await makeFile(fs, "test.html", "text/html", htmlContent);

  prompt("Your finished persistence URL:", htmlFile);
}

webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs);
