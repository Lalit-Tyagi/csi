const { config, uploader } = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary')

const coloudinaryConfig = config({
    cloud_name: 'lucifer07',
    api_key: '695741565517692',
    api_secret: '8SDKYxt4PcwrKY_A9ZladGXwvR0'
});

// const storage = new CloudinaryStorage({
//     cloudinary,
//     folder: 'CSIimages',
//     allowedFormats: 'jpg, jpeg, png,'
// })

module.exports = { coloudinaryConfig, uploader }