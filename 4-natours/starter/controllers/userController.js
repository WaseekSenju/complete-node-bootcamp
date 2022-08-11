const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/APIfeatures');
const catchAsync = require('./../utils/catchAsync');

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
