
const express = require('express');
const router = express.Router();
const TestBankController = require('../Controllers/TestBankController‏‎');
const rateLimiter = require('../Middlewares/rateLimiter');
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require('../Config/CloudinaryConfig');  

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Ba9ma_excelsheet", // Cloudinary folder
    format: async (req, file) => "xlsx", // Ensure the file is saved as .xlsx
    resource_type: "raw", // Necessary for non-image files
  },
});
const upload = multer({ storage });


router.post('/addtestbank',upload.single('excelsheet'),TestBankController.addTestBank);
router.get('/gettestbank',TestBankController.getTestBank);
router.get('/gettestbank/:id',TestBankController.getTestBankById);
router.get('/getTestBankByIdByNumberOfQuestions/:id/:number_of_questions/:user_id',TestBankController.getTestBankByIdByNumberOfQuestions);

router.get('/getTestBankByTopicIdByNumberOfQuestions/:topic_id/:number_of_questions/:user_id/:question_type',TestBankController.getTestBankByTopicIdByNumberOfQuestions);

router.delete('/deletetestbank/:id',TestBankController.deleteTestBank);
//Questions
router.get('/getQuestionsByQuestionCount/:number_of_questions',TestBankController.getQuestionsByQuestionCount);





module.exports = router;