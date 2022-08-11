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

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    //1(a)- Filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1(b)-Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lte|gte|lt|gt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    //2-Sorting
    if (this.queryString.sort) {
      const reqQuery = req.query.sort.split(',').join(' ');
      this.query = this.query.sort(reqQuery);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limit() {
    //3-Field Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  page() {
    //4-Paging
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skipValue = (page - 1) * limit;

    this.query = this.query.skip(skipValue).limit(limit);

    // IDK WHY WE deleted this he said users knows there is not enough data
    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skipValue > numTours) throw new Error('This page does not exist');
    // }
    return this;
  }
}

exports.alisasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //3-Exececuting Query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limit()
      .page();

    const tours = await features.query;

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
