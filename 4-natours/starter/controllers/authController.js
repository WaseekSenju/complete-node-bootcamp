const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const catchAsync = require('../utils/catchAsync');
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const User = require('./../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  console.log(process.env.JWT_COOKIE_EXPIRES_IN);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1)check if email and password do exist ?
  if (!email || !password) {
    return next(new appError('Please provid email and password', 400));
  }
  //2) Check if user exist && is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorrect email or password', 401));
  }
  //console.log(user);
  //3) if everythign is ok send the token to the client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) get the token and check if that is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new appError('Your are not logged in! Please log in to get access', 401)
    );
  }
  //2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new appError('The user belonging to this token no longer exists', 401)
    );
  }
  //4) Check if user changed password after the JWT was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new appError('User recently changed password', 401));
  }
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  //roles is in array  ['admin','lead-guide']
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new appError("You don't have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user on the based of posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new appError('No user with such email address', 404));
  }
  //2)generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false,
  });
  //3) Send it to user's email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to :${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  await sendEmail({
    email: user.email,
    subject: 'Your password token will epxire after 10 mins',
    text: message,
  });
  res.status(200).json({
    status: 'success',
    body: 'Thek hai boss',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });
  //2) If token isn't expired, and there is user, set the new password

  if (!user) {
    return next(new appError('Token is invalid or expire'), 500);
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) Update changedPasswordAt property

  //4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  //1) get user from collection

  const user = await User.findById(req.user.id).select('+password');
  //2) Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new appError('Your current password is wrong', 401));
  }

  //3) update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  //User.findByIdAndUpdate will not work
  //4) log the user in
  createSendToken(user, 200, res);
  //5) changePasswordAt
});
