const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');

router.get('/', statesController.getAllStates);
router.get('/:state', statesController.getState);

// add more routes here later

module.exports = router;