const QRCode = require('qrcode');
const { cloudinary } = require('../config/cloudinary');

const generateQRCode = async (data) => {
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 400,
    margin: 2,
    color: { dark: '#111827', light: '#ffffff' },
  });

  const uploadResult = await cloudinary.uploader.upload(qrDataUrl, {
    folder: 'zbritje.al/qrcodes',
    public_id: `voucher_${data.code}`,
    overwrite: true,
  });

  return {
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    dataUrl: qrDataUrl,
  };
};

const generateVoucherQRData = (voucher) => ({
  platform: 'zbritje.al',
  type: 'voucher',
  code: voucher.code,
  voucherId: voucher._id.toString(),
  dealId: voucher.deal.toString(),
  businessId: voucher.business.toString(),
  userId: voucher.user.toString(),
  expiresAt: voucher.expiresAt,
  checksum: Buffer.from(`${voucher.code}:${voucher._id}`).toString('base64'),
});

module.exports = { generateQRCode, generateVoucherQRData };
