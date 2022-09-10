const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking')
    res.locals.alert =
      "You booking was successful! Please check your email for confirmation. If your booking doesn't show up immediatly please come back later.";
  next();
};
///////////////////////////////////////////////////////////////////////////
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template - PUG File
  // 3) Render the template using the tour data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
  next();
});

///////////////////////////////////////////////////////////////////////////
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating, user'
  });
  if (!tour) {
    return next(new AppError('There is no tour with this name', 404));
  }
  // 2) Build template -- PUG File
  // 3) Render the template using the tour data from step 1
  res
    .status(200)

    .render('tour', {
      title: `${tour.title} Tour`,
      tour
    });
  next();
});

///////////////////////////////////////////////////////////////////////////
exports.getSignUpForm = catchAsync(async (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up'
  });
});

///////////////////////////////////////////////////////////////////////////
exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
});

///////////////////////////////////////////////////////////////////////////
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

///////////////////////////////////////////////////////////////////////////
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  if (!bookings) return next();

  // 2) Find tours with the returned ids
  const tourIds = bookings.map(el => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

///////////////////////////////////////////////////////////////////////////
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
