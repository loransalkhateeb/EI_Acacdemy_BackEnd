const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer.js'); 
const QuestionsController = require('../Controllers/QuestionsController.js'); 
const authMiddleware = require('../Middlewares/authMiddleware.js');  
const rateLimiter = require('../Middlewares/rateLimiter.js');  



router.get("/getQuestionsByCount/:number_of_questions",rateLimiter,QuestionsController.getQuestionsByCount)



module.exports = router 