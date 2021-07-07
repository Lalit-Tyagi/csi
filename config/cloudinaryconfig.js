const { config, uploader } = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary')

const coloudinaryConfig = config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,l̥
})

// const storage = new CloudinaryStorage({
//     cloudinary,
//     folder: 'CSIimages',
//     allowedFormats: 'jpg, jpeg, png,'
// })

module.exports = { coloudinaryConfig, uploader }