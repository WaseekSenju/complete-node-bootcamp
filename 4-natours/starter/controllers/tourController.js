const Tour = require('./../models/tourModel');

// exports.checkId = (req,res,next) => {
//   // const tourId = req.params.id * 1;
//   // console.log(tourId);
//   // if (tourId > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'invalid id',
//   //   });
//   // }
//   next();
// }

// exports.checkRequestBody = (req,res,next) => {
//   if(!req.body.name || !req.body.price){
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing Name or Price',
//     });
//   }

//   next();
// }

exports.getAllTours = async (req, res) => {
  try {
  const queryObj = { ...req.query };

  //1(a)- Filtering
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  //1(b)-Advance Filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(lte|gte|lt|gt)\b/g, (match) => `$${match}`);

  let query = Tour.find(JSON.parse(queryStr));

  //2-Sorting
  if (req.query.sort) {
    
    const reqQuery = (req.query.sort).split(',').join(' ');
    query = query.sort(reqQuery);
  }else{
    query = query.sort('-createdAt');
  }
  
  //3-Field Limiting
  if (req.query.fields) {
    const fields = (req.query.fields).split(',').join(' ');
    query = query.select(fields);
  }else{
    query = query.select('-__v');
  }
  
  //4-Paging
  const page = req.query.page * 1||1;
  const limit = req.query.limit  * 1 ||100;
  const skipValue = (page-1) * limit;
  
  query = query.skip(skipValue).limit(limit);
  

  if(req.query. page){
    const numTours = await Tour.countDocuments();
    if(skipValue>numTours) throw new Error('This page does not exist');
    
  }

  //3-Exececuting Query
  const tours = await query;
 
    res.status(200).json({
      status: 'status',
      requestTime: req.requsetTime,
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};
exports.getTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  console.log(tour);
  try {
    res.status(200).json({
      status: 'status',
      requestTime: req.requsetTime,
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};
