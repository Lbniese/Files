// import express's Router() - isolated instance of middleware and routes (mini-application)
// - can only perform middwalre and routing functions
const router = require('express').Router();
// 'multer' is a middleware for handling multipart/form-data, which we use for file uploads
const multer = require('multer');
// import filestorage
const fs = require('fs');
// import path (to get root path etc)
const path = require('path');

/* Multer:
Multer is a node.js middleware for handling multipart/form-data,
which is primarily used for uploading files.
*/
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './storage');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});

// alternative to using local storage would be to connect multer to a S3 Bucket
const upload = multer({
  storage,
});

// router for get-call for downloading a specific file
router.get('/download/:file(*)', (req, res) => {
  console.log('Download call was made in backend');
  // start building the file path
  const { file } = req.params;
  const downloadFilePath = `${path.resolve('.')}/storage/${file}`;

  console.log(`Downloading: ${downloadFilePath}`);
  // use express' helper 'download' to download the file
  res.download(downloadFilePath, file, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Downloading successfully!');
    }
  });
});

// router for get-call for deleting a specific file
router.get('/delete/:file(*)', (req, res) => {
  console.log('Delete call was made in backend');
  // start building the file path
  const { file } = req.params;
  const deleteFilePath = `${path.resolve('.')}/storage/${file}`;

  console.log(`Deleting: ${deleteFilePath}`);
  // deleting file in the path 'deleteFilePath' and redirect to the 'dashboard' afterwards
  fs.unlink(deleteFilePath, () => {
    console.log(`File deleted: ${deleteFilePath}`);
    res.redirect('/files');
  });
});

// post-call for uploading file that's in the 'files-to-upload' file-browser
// upload.single takes care of uploading a single file :)
router.post('/files', upload.single('file-to-upload'), (req, res) => {
  console.log('redirect to /files');
  res.redirect('/files');
});

// function to convert bytes to 'human readable' sizes
// credits: https://stackoverflow.com/a/18650828
function getFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

// get-call for fetching all files from the local folder called 'storage'
router.get('/getfiles', (req, res) => {
  // defining dir location
  const dir = './storage';
  // checking if the storage folder exists and if not then creates it
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  // store data about the directory './storage'
  const storageArray = fs.readdirSync(dir);

  console.log(`This is what's inside storageArray: ${storageArray}`);

  const storageObjectArray = [];

  // danish date formatter :)
  const getDateFormat = (date) => {
    // format it if it exists
    if (date != null) {
      // use DateTimeFormat with locale being da-DK (for danish format)
      return `${new Intl.DateTimeFormat('da-DK', {
        // specific/custom formatting
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
      }).format(date)}`;
    }
    return 'invalid data given';
  };

  // perform this for each file in the storageArray
  storageArray.forEach((directoryFile) => {
    // define structure of a storageObject
    const storageObject = {
      name: directoryFile, size: '', added: '', extension: '',
    };

    // print each file in the directory into the log
    console.log(`directory file: ${directoryFile}`);

    // store value of the file
    const fileSizeInBytes = fs.statSync(`storage/${directoryFile}`).size;

    // store date the file was added
    const fileAdded = fs.statSync(`storage/${directoryFile}`).atime;

    // store extension / file-format
    const fileExtension = path.extname(directoryFile);

    // format the size using the getFileSize function and set the size into the storageObject
    storageObject.size = getFileSize(fileSizeInBytes);

    // format the date using the getDateFormat function and set the date into the storageObject
    storageObject.added = getDateFormat(fileAdded);

    // set extension info into storageObject
    storageObject.extension = fileExtension;

    // append the element 'storageObject' to storageObjectArray
    storageObjectArray.push(storageObject);
  });
  // send the storageObjectArray as a response
  res.send(storageObjectArray);
});

module.exports = {
  router,
};
