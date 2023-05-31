async function makeFile(fs,fileName,fileType,content){await new Promise(res=>{fs.root.getFile(fileName,{},fileEntry=>{fileEntry.remove(res)},res)});return await new Promise(res=>{fs.root.getFile(fileName,{create:true},fileEntry=>{fileEntry.createWriter(fileWriter=>{fileWriter.write(new Blob([content],{type:fileType}));res(fileEntry.toURL())})})})}async function onInitFs(fs){let htmlContent=`<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FoxLoader</title>
  <script src="zip.js"></script>

</head>

<body>

  <div>
    <input type="file" id="resourcesFileInput" class="zipinst">
    <button onclick="uploadResource();" class="zipinst">Upload the zip.flr file!</button>
  </div>


  <input type="file" id="zipFileInput" class="zip" disabled>
  <button onclick="uploadZip();" class="zip" disabled>Load a .flz file!</button>
  <div>Made by <a href="https://foxmoss.com/personal/">foxmoss</a> from foxmoss@mediaology.com</div>


  <h2>Game List</h2>
  <ul id="fileList"></ul>

  <script>
    checkFileExists("zip.js")
      .then(fileExists => {
        if (fileExists) {
          document.querySelectorAll(".zipinst").forEach(element => {
            element.remove();
          });
          document.querySelectorAll(".zip").forEach(element => {
            element.disabled = false;
          });
        }
      });



    async function uploadResource() {
      const fileInput = document.getElementById('resourcesFileInput');
      const file = fileInput.files[0];
      makeFile("zip.js", await file.text())
    }

    function checkFileExists(filePath) {
      return new Promise((resolve, reject) => {
        window.webkitRequestFileSystem(
          window.TEMPORARY,
          1024 * 1024 * 10,
          function (fs) {
            fs.root.getFile(
              filePath,
              { create: false },
              function (fileEntry) {
                resolve(true);
              },
              function (error) {
                resolve(false);
              }
            );
          },
          function (error) {
            reject(error);
          }
        );
      });
    }
    function uploadZip() {
      const fileInput = document.getElementById('zipFileInput');
      const file = fileInput.files[0];

      if (!file) {
        alert('Please select a zip file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const zipFile = new JSZip();
        zipFile.loadAsync(e.target.result).then(function (zip) {
          const fileList = document.getElementById('fileList');
          zip.forEach(function (relativePath, zipEntry) {
            if (!zipEntry.dir) {
              zipEntry.async('blob').then(function (blob) {
                if (zipEntry.name.includes("index.html")) {

                  const fileListItem = document.createElement('li');
                  const fileListLink = document.createElement('a');
                  const fileName = document.createTextNode(zipEntry.name);
                  fileListLink.href = "filesystem:" + document.URL + "temporary/" + zipEntry.name;
                  fileListLink.appendChild(fileName);
                  fileListItem.appendChild(fileListLink);
                  fileList.appendChild(fileListItem);
                }
                makeFileBlob(zipEntry.name, blob);
              });
            } else {
              makeDir(zipEntry.name);
            }
          });
        });
      };

      reader.readAsArrayBuffer(file);
    }

    async function makeFileBlob(fileName, content) {
      let fs = await new Promise((res) => {
        window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 10, res);
      });

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
            fileWriter.write(content);
            res(fileEntry.toURL());
          });
        });
      });
    }

    async function makeFile(fileName, content) {
      let fs = await new Promise((res) => {
        window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 10, res);
      });

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
            fileWriter.write(new Blob([content]));
            res(fileEntry.toURL());
          });
        });
      });
    }
    async function makeDir(name) {

      let fs = await new Promise((res) => {
        window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 10, res);
      });
      fs.root.getDirectory(
        name,
        { create: true },
        (directoryEntry) => {
        }
      );
    }

    async function scanFiles() {
      let fs = await new Promise((res) => {
        window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 10, res);
      });
      const fileList = document.getElementById('fileList');

      if (fs.root.isDirectory) {
        let directoryReader = fs.root.createReader();
        let directoryContainer = document.createElement("ul");
        fileList.appendChild(directoryContainer);
        directoryReader.readEntries((entries) => {
          entries.forEach((entry) => {

            if (entry.isDirectory) {


              const li = document.createElement('li');
              const a = document.createElement('a');
              a.textContent = entry.name;
              a.href = "filesystem:" + document.URL + "temporary/" + entry.name + "/index.html";
              li.appendChild(a);
              fileList.appendChild(li);

            }
          });
        });
      }
    }
    scanFiles();

  </script>
</body>

</html>
`;let htmlFile=await makeFile(fs,"test.html","text/html",htmlContent);prompt("Your finished persistence URL:",htmlFile)}webkitRequestFileSystem(window.TEMPORARY,1024*1024,onInitFs);
