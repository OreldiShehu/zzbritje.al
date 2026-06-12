const QRCode = require('qrcode');
const { cloudinary } = require('../config/cloudinary');

const generateQRCode = async (data) => {
  // data is a URL string now
  const qrDataUrl = await QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 400,
    margin: 2,
    color: { dark: '#111827', light: '#ffffff' },
  });

  const code = data.split('/').pop();
  const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
    folder: 'zbritje.al/qrcodes',
    public_id: `voucher_${code}`,
    overwrite: true,
  });

  return {
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    dataUrl: qrDataUrl,
  };
};

const generateVoucherQRData = (voucher) => {
  const clientUrl = process.env.CLIENT_URL || 'https://client-one-tawny-73.vercel.app';
  return `${clientUrl}/v/${voucher.code}`;
};

module.exports = { generateQRCode, generateVoucherQRData };
