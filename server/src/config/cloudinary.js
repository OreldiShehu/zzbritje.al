const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `zbritje.al/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1200, height: 800, crop: 'limit' },
      ],
    },
  });
};

const dealStorage = createStorage('deals');
const avatarStorage = createStorage('avatars');
const businessStorage = createStorage('businesses');
const reviewStorage = createStorage('reviews');

const uploadDealImages = multer({
  storage: dealStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
}).array('images', 8);

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
}).single('avatar');

const uploadBusinessImages = multer({
  storage: businessStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
}).array('images', 5);

const uploadReviewImages = multer({
  storage: reviewStorage,
  limits: { fileSize: 3 * 1024 * 1024, files: 3 },
}).array('images', 3);

const deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  uploadDealImages,
  uploadAvatar,
  uploadBusinessImages,
  uploadReviewImages,
  deleteImage,
};
