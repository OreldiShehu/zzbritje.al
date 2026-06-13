const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { generateTokens, setTokenCookies, verifyRefreshToken } = require('../middleware/auth.middleware');
const { sendEmail, templates } = require('../utils/email');
const { sendSms } = require('../utils/sms');
const { createAuditLog } = require('../utils/helpers');

const sendTokenResponse = (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokenCookies(res, accessToken, refreshToken);
  user.password = undefined;
  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      loyaltyLevel: user.loyaltyLevel,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, businessName, email, password, phone, role, referralCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('Email already in use.', 409));

  const userData = { firstName, lastName, email, password, phone };
  if (role === 'business') {
    userData.role = 'business';
    if (businessName) userData.businessName = businessName;
  }

  let referredBy;
  if (referralCode) {
    referredBy = await User.findOne({ referralCode });
    if (referredBy) userData.referredBy = referredBy._id;
  }

  const user = await User.create(userData);

  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const emailData = templates.welcome(user);
    emailData.html = emailData.html.replace('${user._verifyToken}', verifyToken);
    await sendEmail({ to: user.email, ...emailData });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }

  if (referredBy) {
    const Referral = require('../models/Referral');
    await Referral.create({
      referrer: referredBy._id,
      referred: user._id,
      referralCode,
    });
    await User.findByIdAndUpdate(referredBy._id, { $inc: { referralCount: 1 } });
  }

  await createAuditLog({ actor: user, action: 'register', resource: 'User', resourceId: user._id, description: 'New user registration', req });

  sendTokenResponse(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password.', 400));

  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
  if (!user) return next(new AppError('Invalid email or password.', 401));

  if (user.isLocked) {
    return next(new AppError('Account temporarily locked due to too many failed attempts. Try again in 2 hours.', 423));
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    await user.incLoginAttempts();
    return next(new AppError('Invalid email or password.', 401));
  }

  if (user.isBlocked) return next(new AppError('Account suspended. Contact support.', 403));
  if (!user.isActive) return next(new AppError('Account deactivated.', 401));
  if (!user.isEmailVerified && !['admin', 'superadmin'].includes(user.role)) return next(new AppError('Ju lutemi verifikoni email-in tuaj para se të hyni.', 403));

  // Reset login attempts on success
  if (user.loginAttempts > 0) {
    await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
  }

  user.lastLogin = new Date();
  user.lastLoginIP = req.ip;
  await user.save({ validateBeforeSave: false });

  await createAuditLog({ actor: user, action: 'login', resource: 'User', resourceId: user._id, req });
  sendTokenResponse(user, 200, res);
});

exports.logout = catchAsync(async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken || req.headers['x-refresh-token'];
  if (!token) return next(new AppError('No refresh token provided.', 401));

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return next(new AppError('Invalid or expired refresh token.', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) return next(new AppError('User not found.', 401));

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokenCookies(res, accessToken, refreshToken);
  res.status(200).json({ success: true, accessToken, refreshToken });
});

exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required.', 400));

  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ success: true, message: 'Nëse email-i ekziston, do të merrni një link verifikimi.' });
  if (user.isEmailVerified) return next(new AppError('Ky email është tashmë i verifikuar.', 400));

  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const emailData = templates.welcome(user);
  emailData.html = emailData.html.replace('${user._verifyToken}', verifyToken);
  await sendEmail({ to: user.email, ...emailData });

  res.status(200).json({ success: true, message: 'Email-i i verifikimit u dërgua. Kontrolloni kutinë postare.' });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const rawToken = req.params.token || req.body.token;
  if (!rawToken) return next(new AppError('Token is required.', 400));
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired verification token.', 400));

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user.walletBalance += 200;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully. 200 ALL bonus added to your wallet!' });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No account with that email address.', 404));

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({ to: user.email, ...templates.passwordReset(user, resetToken) });
    res.status(200).json({ success: true, message: 'Password reset email sent.' });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send password reset email. Please try again.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) return next(new AppError('Invalid or expired reset token.', 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  await createAuditLog({ actor: user, action: 'password_reset', resource: 'User', resourceId: user._id, req, severity: 'warning' });
  sendTokenResponse(user, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const isCorrect = await user.comparePassword(req.body.currentPassword);
  if (!isCorrect) return next(new AppError('Current password is incorrect.', 401));

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.googleCallback = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user._id);
  setTokenCookies(res, accessToken, refreshToken);
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
});

exports.facebookCallback = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user._id);
  setTokenCookies(res, accessToken, refreshToken);
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('preferences.categories', 'name slug icon')
    .populate('businessId', 'name slug logo verificationStatus');
  res.status(200).json({ success: true, data: user });
});

exports.sendPhoneOtp = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+phoneOtpSentAt');
  if (!user.phone) return next(new AppError('Ju nuk keni numër telefoni. Shtojeni në profil fillimisht.', 400));
  if (user.isPhoneVerified) return next(new AppError('Numri juaj i telefonit është tashmë i verifikuar.', 400));

  // Rate limit: 1 OTP per 60 seconds
  if (user.phoneOtpSentAt && Date.now() - user.phoneOtpSentAt.getTime() < 60 * 1000) {
    return next(new AppError('Ju lutemi prisni 60 sekonda para se të kërkoni kod të ri.', 429));
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hash = crypto.createHash('sha256').update(otp).digest('hex');

  user.phoneOtpHash = hash;
  user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  user.phoneOtpSentAt = new Date();
  await user.save({ validateBeforeSave: false });

  try {
    await sendSms(user.phone, `Kodi juaj i verifikimit për Zbritje.al është: ${otp}\nKodi skadon pas 10 minutash.`);
  } catch (err) {
    user.phoneOtpHash = undefined;
    user.phoneOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Dërgimi i SMS-it dështoi. Kontrolloni numrin e telefonit.', 500));
  }

  res.status(200).json({ success: true, message: 'Kodi OTP u dërgua në telefonin tuaj.' });
});

exports.verifyPhoneOtp = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) return next(new AppError('Ju lutemi jepni kodin OTP.', 400));

  const user = await User.findById(req.user.id).select('+phoneOtpHash +phoneOtpExpires');
  if (!user.phoneOtpHash || !user.phoneOtpExpires) {
    return next(new AppError('Nuk ka kod aktiv. Kërkoni një kod të ri.', 400));
  }
  if (user.phoneOtpExpires < new Date()) {
    return next(new AppError('Kodi OTP ka skaduar. Kërkoni një kod të ri.', 400));
  }

  const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
  if (hash !== user.phoneOtpHash) {
    return next(new AppError('Kodi OTP është i pasaktë.', 400));
  }

  user.isPhoneVerified = true;
  user.phoneOtpHash = undefined;
  user.phoneOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Numri i telefonit u verifikua me sukses!' });
});
