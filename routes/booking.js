var express = require('express');
var router = express.Router();

const service = require('../services/booking');

const private = require('../middlewares/private');

router.get('/:id/reservations', private.checkJWT, service.getAll);

router.get('/:id/reservations/:idReservation', private.checkJWT, service.getById);

router.post('/:id/reservations', private.checkJWT, service.add);

router.patch('/:id/reservations/:idReservation', private.checkJWT, service.update);

router.delete('/:id/reservations/:idReservation', private.checkJWT, service.delete);

module.exports = router;