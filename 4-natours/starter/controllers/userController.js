const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/APIfeatures');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};
exports.getAllUsers = catchAsync(async (req, res) => {
  //3-Exececuting Query
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limit()
    .page();

  const user = await features.query;

  res.status(200).json({
    status: 'status',
    requestTime: req.requsetTime,
    results: user.length,
    data: { user },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');

  // 2) simply update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    isActive: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'No implementation for this route',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'No implementation for this route',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'No implementation for this route',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'No implementation for this route',
  });
};
