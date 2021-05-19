const router = require('express').Router();
// 'multer' is a middleware for handling multipart/form-data, which we use for file uploads
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// File Management - Start
/* Multer:
Multer is a node.js middleware for handling multipart/form-data,
which is primarily used for uploading files.
It is written on top of busboy for maximum efficiency.
*/
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './storage');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({
  storage,
});

router.get('/download/:file(*)', (req, res) => {
  const { file } = req.params;
  const downloadFilePath = `${path.resolve('.')}/storage/${file}`;

  res.download(downloadFilePath, file, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Downloading successfully!');
    }
  });
});

router.get('/delete/:file(*)', (req, res) => {
  console.log('Delete call was made in backend');
  const { file } = req.params;
  const deleteFilePath = `${path.resolve('.')}/storage/${file}`;

  console.log(`deleting: ${deleteFilePath}`);
  fs.unlink(deleteFilePath, () => {
    console.log(`File deleted: ${deleteFilePath}`);
    res.redirect('/files');
  });
});

router.post('/files', upload.single('file-to-upload'), (req, res) => {
  console.log('redirect to /files');
  res.redirect('/files');
});

router.get('/getfiles', (req, res) => {
  const dir = './storage';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const storageArray = fs.readdirSync(dir);

  const storageObjectArray = [];

  const getDateFormat = (date) => {
    if (date != null) {
      return `${new Intl.DateTimeFormat('da-DK', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
      }).format(date)}`;
    }
    return 'invalid data given';
  };

  // credits: https://stackoverflow.com/a/18650828
  function getFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  }

  storageArray.forEach((directoryFile) => {
    const storageObject = {
      name: directoryFile, size: '', added: '', extension: '',
    };

    const fileSizeInBytes = fs.statSync(`storage/${directoryFile}`).size;

    const fileAdded = fs.statSync(`storage/${directoryFile}`).atime;

    const fileExtension = path.extname(directoryFile);

    storageObject.size = getFileSize(fileSizeInBytes);

    storageObject.added = getDateFormat(fileAdded);

    storageObject.extension = fileExtension;

    storageObjectArray.push(storageObject);
  });
  res.send(storageObjectArray);
});

// File Management - End

module.exports = {
  router,
};
