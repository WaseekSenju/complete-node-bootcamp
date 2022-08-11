const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const appError = require('./../utils/appError');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role:req.body.role,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,

  });
  const token = signToken(newUser._id);
  res.status(201).json({
    token: token,
    status: 'success',
    data: newUser,
  });
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
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token: token,
  });
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

  if(!token){
    return next( new appError('Your are not logged in! Please log in to get access',401));
  }
  //2) Verification token
  const decoded = await  promisify(jwt.verify)(token,process.env.JWT_SECRET);

  //3) Check if user still exist
  const freshUser = await User.findById(decoded.id);
  if(!freshUser){
     return next(new appError('The user belonging to this token no longer exists',401));
  }
  //4) Check if user changed password after the JWT was issued
  if(freshUser.changedPasswordAfter(decoded.iat)){
    return next(new appError('User recently changed password',401));
  };
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) =>{
  //roles is in array  ['admin','lead-guide']
  return (req,res,next)=>{
if(!roles.includes(req.user.role)){
  next(new appError('You don\'t have permission to perform this action',403));

}
  next();
}};



