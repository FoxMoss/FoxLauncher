window.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("flr").addEventListener("click", uploadResource);
  document.getElementById("flz").addEventListener("click", uploadZip);

  checkFileExists("zip.js").then((fileExists) => {
    if (fileExists) {
      document.querySelectorAll(".zipinst").forEach((element) => {
        element.remove();
      });
      document.querySelectorAll(".zip").forEach((element) => {
        element.removeAttribute("disabled");
      });
    }
  });

  scanFiles();
  scanPerms();

  if (chrome.tabs != undefined) {
    document.body.addEventListener("click", function(e) {
      if (e.target) {
        // I know this hurts your eyes, && just doesn't work with awk
        if (e.target.nodeName == "A") {
          chrome.tabs.create({
            url: e.target.href,
          });
        }
      }
    });
  }
});

var cspInline = false;
var specialPerms = [];

// Upload the zip.js file into the filesystem
async function uploadResource() {
  const fileInput = document.getElementById("resourcesFileInput");
  const file = fileInput.files[0];
  makeFile("zip.js", await file.text());
  alert("Reload this tab.");
}

// Check if file exists in the file system.
function checkFileExists(filePath) {
  return new Promise((resolve, reject) => {
    window.webkitRequestFileSystem(
      window.TEMPORARY,
      1024 * 1024 * 10,
      function(fs) {
        fs.root.getFile(
          filePath,
          { create: false },
          function(fileEntry) {
            resolve(true);
          },
          function(error) {
            resolve(false);
          }
        );
      },
      function(error) {
        reject(error);
      }
    );
  });
}

// Grab all index.html files for a zip archive
function grabIndices(zip) {
  let ret = [];
  for (file in zip.files) {
    if (file.includes("index.html")) {
      ret.push(zip.files[file]);
    }
  }
  return ret;
}

// Take a uploaded .flz and process it into the file system
function uploadZip() {
  const fileInput = document.getElementById("zipFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a zip file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function(e) {
    const zipFile = new JSZip();

    let blobs = {};
    let shouldLoad = false;
    await zipFile.loadAsync(e.target.result).then(async function(zip) {
      const fileList = document.getElementById("fileList");

      let indexEntries = grabIndices(zip);

      for (let fileName in zip.files) {
        if (!zip.files[fileName].dir) {
          let blob = await zip.files[fileName].async("blob");
          if (zip.files[fileName].name.includes("config.flc")) {
            shouldLoad = checkConf(await zip.files[fileName].async("text"));
          }
          blobs[zip.files[fileName].name] = blob;
        } else {
          await makeDir(zip.files[fileName].name.split("/")[0]);
          await makeDir(zip.files[fileName].name);
        }
      }
      if (!(await shouldLoad)) {
        alert("Permissions are probably wrong!");
        return;
      }
      for (blob in blobs) {
        await makeFileBlob(blob, blobs[blob]);
      }
      for (index in indexEntries) {
        const fileListItem = document.createElement("li");
        const fileListLink = document.createElement("a");
        const fileName = document.createTextNode(
          indexEntries[index].name.replace("/index.html", "")
        );
        fileListLink.href =
          "filesystem:" +
          window.location.origin +
          "/temporary/" +
          indexEntries[index].name;
        fileListLink.appendChild(fileName);
        fileListItem.appendChild(fileListLink);
        fileList.appendChild(fileListItem);
      }
    });
  };

  reader.readAsArrayBuffer(file);
}

// Check if some permissions are in your systems permissions.
function checkPerms(requiredPerms) {
  return new Promise((resolve) => {
    requiredPerms.forEach((perm) => {
      if (!specialPerms.includes(perm.textContent)) {
        resolve(false);
      }
    });
    resolve(true);
  });
}

// Check if a text is a valid conf file for your system
async function checkConf(conf) {
  let parser = new DOMParser();
  let confDoc = parser.parseFromString(conf, "text/xml");

  let requiredPerms = confDoc.querySelectorAll("SETTINGS > PERMISSIONS > PERM");

  return await checkPerms(requiredPerms);
}
function getAllPerms() {
  return new Promise((resolve) => {
    chrome.permissions.getAll((response) => resolve(response["permissions"]));
  });
}

// Create a list of all chrome.permissions
async function scanPerms() {
  const permList = document.getElementById("permList");
  try {
    specialPerms = await getAllPerms();
    specialPerms.push("boykisser");
  } catch (error) {
    specialPerms = ["boykisser"];
  }
  if (cspInline) {
    specialPerms.push("cspinline");
  }
  specialPerms.forEach((perm) => {
    const permListItem = document.createElement("li");
    const permName = document.createTextNode(perm);
    permListItem.appendChild(permName);
    permList.appendChild(permListItem);
  });
}

// Add file to FS using blob
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

// Add file to FS path using raw text
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

// Add dir to FS
async function makeDir(name) {
  let fs = await new Promise((res) => {
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 10, res);
  });
  fs.root.getDirectory(name, { create: true }, (directoryEntry) => { });
}

// Look in the FS for folders
async function scanFiles() {
  let fs = await new Promise((res) => {
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 10, res);
  });
  const fileList = document.getElementById("fileList");

  let directoryReader = fs.root.createReader();
  let directoryContainer = document.createElement("ul");
  fileList.appendChild(directoryContainer);
  directoryReader.readEntries((entries) => {
    entries.forEach((entry) => {
      if (entry.isDirectory) {
        const fileListItem = document.createElement("li");
        const fileListLink = document.createElement("a");
        const fileName = document.createTextNode(entry.name);
        fileListLink.href =
          "filesystem:" +
          window.location.origin +
          "/temporary/" +
          entry.name +
          "/index.html";
        fileListLink.appendChild(fileName);
        fileListItem.appendChild(fileListLink);
        fileList.appendChild(fileListItem);
      }
    });
  });
}
