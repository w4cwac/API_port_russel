var express = require('express');
var router = express.Router();

const userRoute = require('../routes/users');
const catwayRoute = require('../routes/catways');
const bookingRoute = require('../routes/booking');
const dashboardRoute = require('../routes/dashboard');

router.use('/users', userRoute);
router.use('/catways', catwayRoute);
router.use('/catways', bookingRoute);
router.use('/tableau-de-bord', dashboardRoute);

module.exports = router;
