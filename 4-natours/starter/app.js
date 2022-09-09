const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1) Global Middlwares

//Set Secuiry HTTP headers
app.use(helmet());

//Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit request from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requset from this IP please try again in an hour',
});

app.use('/api', limiter);

//Body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);

// Data sanitization against noSQL query injection and also
// data sanitization against XXS

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Test Middleware
app.use((req, res, next) => {
  req.requsetTime = new Date().toISOString();
  console.log(req.headers.authorization);
  console.log(req.requsetTime);
  next();
});

//2- Routes Handler
// const getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'status',
//     requestTime: req.requsetTime,
//     results: tours.length,
//     data: { tours },
//   });
// };
// const getTour = (req, res) => {
//   const tourId = req.params.id * 1;
//   if (tourId > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid id',
//     });
//   }
//   const tour = tours.find((el) => el.id === tourId);

//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
// };
// const createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   const newTours = JSON.stringify(tours);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     newTours,
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
//   console.log(req.body);
// };

// const updateTour = (req, res) => {
//   const tourId = req.params.id * 1;
//   if (tourId > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid id',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<Updated tour here...>',
//     },
//   });
// };

// const deleteTour = (req, res) => {
//   const tourId = req.params.id * 1;
//   if (tourId > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid id',
//     });
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };

// const getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'No implementation for this route',
//   });
// };
// const getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'No implementation for this route',
//   });
// };
// const createUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'No implementation for this route',
//   });
// };
// const updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'No implementation for this route',
//   });
// };
// const deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'No implementation for this route',
//   });
// };

// //3- Routes
// const tourRouter = express.Router();
// const userRouter = express.Router();

// //We refactored it
// // //app.get('/api/v1/tours', getAllTours);
// // app.get('/api/v1/tours/:id/', getTour);
// // //app.post('/api/v1/tours',createTour );
// // app.patch('/api/v1/tours/:id', updateTour);
// // app.delete('/api/v1/tours/:id', deleteTour);

// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter
//   .route('/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);

// userRouter.route('/').get(getAllUsers).post(createUser);
// userRouter
//   .route('/:id')
//   .get(getUser)
//   .patch(updateUser)
// .delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new Error(`Cant find the ${req.originalUrl} on this server`), 404);
});

app.use(globalErrorHandler);
module.exports = app;
