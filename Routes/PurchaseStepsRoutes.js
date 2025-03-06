const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer.js'); 
const PurchaseStepsController = require('../Controllers/PurchaseStepsController.js'); 
const authMiddleware = require('../Middlewares/authMiddleware.js');  
const rateLimiter = require('../Middlewares/rateLimiter.js');  


router.post('/add', multer.single('img'), PurchaseStepsController.createPurchasesteps);

router.put('/update/:id', rateLimiter, multer.single('img'), PurchaseStepsController.updatepurchasesteps);

router.get('/', PurchaseStepsController.getpurchasesteps);


router.get('/PurchaseStepsbyid/:id', PurchaseStepsController.getpurchasestepsById);


router.delete('/delete/:id', PurchaseStepsController.deletepurchasesteps);

module.exports = router;
