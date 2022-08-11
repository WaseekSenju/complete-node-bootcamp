const appError = require('./../utils/appError');
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status, 
      message: err.message,
    });
  } else {
    // 1) log the error
    console.log('ERROR', err);

    //2) Send generate message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};
const handleJWTError = err => new appError('Invalid token. Please login again',401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
let error = {...err};
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {

    if(error.name === 'JsonWebTokenError'){
      error = handleJWTError(error);
    }
    sendErrorProd(error, res);
  }
};
