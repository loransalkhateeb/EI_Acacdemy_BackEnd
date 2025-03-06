const express = require('express');
const router = express.Router();
const boxSliderController = require('../Controllers/BoxUnderSliderController');
const rateLimiter = require('../Middlewares/rateLimiter');
const authMiddleware = require('../Middlewares/authMiddleware'); 


router.post('/addBoxSlider', rateLimiter, boxSliderController.addBoxSlider);


router.get('/getBoxSliders', rateLimiter, boxSliderController.getBoxSliders);


router.get('/getBoxSlider/:id', rateLimiter, boxSliderController.getBoxSliderById);


router.put('/updateBoxSlider/:id', rateLimiter, boxSliderController.updateBoxSlider);


router.delete('/deleteBoxSlider/:id', rateLimiter, boxSliderController.deleteBoxSlider);

module.exports = router;
