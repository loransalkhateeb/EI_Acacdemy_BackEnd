const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./CloudinaryConfig');  

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Basma_Academy',
    resource_type: 'auto',
  },
});

const upload = multer({ storage });

module.exports = upload;