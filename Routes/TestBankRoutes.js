
const express = require('express');
const router = express.Router();
const TestBankController = require('../Controllers/TestBankController‏‎');
const rateLimiter = require('../Middlewares/rateLimiter');
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require('../Config/CloudinaryConfig');  
const upload = require('../Config/Multer');




router.post('/addtestbank', 
  (req, res, next) => {
    const uploadMiddleware = upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
      { name: 'excelsheet', maxCount: 1 },
    ]);
    // استخدام middleware لتحميل الملفات
    uploadMiddleware(req, res, next);
  },
  TestBankController.addTestBank  // استدعاء الـ controller بعد تحميل الملفات
);

router.get('/gettestbank',TestBankController.getTestBank);
router.get('/gettestbank/:id',TestBankController.getTestBankById);
router.get('/getTestBankByIdByNumberOfQuestions/:id/:number_of_questions/:user_id',TestBankController.getTestBankByIdByNumberOfQuestions);

router.get('/getTestBankByTopicIdByNumberOfQuestions/:topic_id/:number_of_questions/:user_id/:question_type',TestBankController.getTestBankByTopicIdByNumberOfQuestions);


router.get('/getTopicsByTestBankId/:testBank_id',TestBankController.getTopicsByTestBankId);

router.delete('/deletetestbank/:id',TestBankController.deleteTestBank);
//Questions
router.get('/getQuestionsByQuestionCount/:number_of_questions',TestBankController.getQuestionsByQuestionCount);





module.exports = router;