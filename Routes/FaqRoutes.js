const express = require('express');
const router = express.Router();
const faqController = require('../Controllers/FaqController');
const rateLimiter = require('../Middlewares/rateLimiter');
const authMiddleware = require('../Middlewares/authMiddleware'); 


router.post('/createFaq', rateLimiter, faqController.addFaq);


router.get('/getFaqs', rateLimiter, faqController.getFaq);


router.get('/getFaq/:id', rateLimiter, faqController.getFaqById);


router.put('/updateFaq/:id', rateLimiter, faqController.updateFaq);


router.delete('/deleteFaq/:id', rateLimiter, faqController.deleteFaq);

module.exports = router;
