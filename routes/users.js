var express = require('express');
var router = express.Router();

const service = require('../services/users');

const private = require('../middlewares/private');

router.get('/:id', service.getById);

router.post('/',  service.add);

router.patch('/:id', service.update);

router.delete('/:id', service.delete);

router.post('/authenticate', service.authenticate);

module.exports = router;
