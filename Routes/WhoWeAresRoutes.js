const express = require('express');
const router = express.Router();
const whoweareController = require('../Controllers/WhoWeAreController');
const rateLimiter = require('../Middlewares/rateLimiter');
const authMiddleware = require('../Middlewares/authMiddleware');  


router.post('/createWhoweare', rateLimiter, whoweareController.addWhoweare);


router.get('/getWhoweares', rateLimiter, whoweareController.getWhoweare);


router.get('/getWhoweareById/:id', rateLimiter, whoweareController.getWhoweareById);


router.put('/updateWhoweare/:id', rateLimiter, whoweareController.updateWhoweare);


router.delete('/deleteWhoweare/:id', rateLimiter, whoweareController.deleteWhoweare);

module.exports = router;
