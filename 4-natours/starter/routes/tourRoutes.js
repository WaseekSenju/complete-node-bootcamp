const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

//router.param('id', tourController.checkId);

router
  .route('/top-5-cheap')
  .get(tourController.alisasTopTour, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//You could have also put the catchAsync function here but that is much better there
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);

module.exports = router;
