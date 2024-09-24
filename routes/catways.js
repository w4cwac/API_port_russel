var express = require('express');
var router = express.Router();

const service = require('../services/catways');

const private = require('../middlewares/private');

router.get('/', private.checkJWT, service.getAll);

router.get('/:id', private.checkJWT, service.getById);

router.post('/', private.checkJWT, service.add);

router.patch('/:id', private.checkJWT, service.update);

router.delete('/:id', private.checkJWT, service.delete);

module.exports = router;