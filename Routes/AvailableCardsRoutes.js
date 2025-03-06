const express = require("express");
const router = express.Router();
const multer = require("../../Basma_New_Version/Config/Multer");
const AvailableCardsController = require("../../Basma_New_Version/Controllers/AvailableCardsController");
const authMiddleware = require("../../Basma_New_Version/MiddleWares/authMiddleware");
const rateLimiter = require("../../Basma_New_Version/MiddleWares/rateLimiter");

router.post('/create-available-cards', AvailableCardsController.createAvailableCard); 
router.get('/available-cards', AvailableCardsController.getAllAvailableCards);
router.get('/available-cards/:id', AvailableCardsController.getAvailableCardById); 
router.put('/available-cards/:id', AvailableCardsController.updateAvailableCard); 
router.delete('/available-cards/:id', AvailableCardsController.deleteAvailableCard);

router.get('/', AvailableCardsController.getAllGovernorates);
router.get('/available-cardsbygovermentId/:governorate_id', AvailableCardsController.getAvailableCardBygovermentId); 
router.post('/add', AvailableCardsController.createGovernorate); 
router.delete('/delete/:id', AvailableCardsController.deleteGovernorate);

module.exports = router;
