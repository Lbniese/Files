const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './storage');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

router.get('/download/:file(*)', handleFileDownload);
router.get('/delete/:file(*)', handleFileDelete);
router.post('/files', upload.single('file-to-upload'), (req, res) => res.redirect('/files'));
router.get('/getfiles', fetchFiles);

function handleFileDownload(req, res) {
  const filePath = constructFilePath(req.params.file);
  res.download(filePath, req.params.file, error => {
    if (error) console.log(error);
  });
}

function handleFileDelete(req, res) {
  const filePath = constructFilePath(req.params.file);
  fs.unlink(filePath, () => res.redirect('/files'));
}

function fetchFiles(req, res) {
  const dir = './storage';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const files = fs.readdirSync(dir).map(fileName => createFileObject(fileName));
  res.send(files);
}

function constructFilePath(filename) {
  return path.join(path.resolve('.'), 'storage', filename);
}

function createFileObject(fileName) {
  const fullPath = path.join('storage', fileName);
  const { size, atime } = fs.statSync(fullPath);
  return {
    name: fileName,
    size: getFileSize(size),
    added: getDateFormat(atime),
    extension: path.extname(fileName),
  };
}

function getFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

function getDateFormat(date) {
  if (!date) return 'invalid data given';
  return new Intl.DateTimeFormat('da-DK', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

module.exports = {
  router,
};
