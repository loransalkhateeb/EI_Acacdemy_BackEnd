const express = require('express');
const router = express.Router();
const ExamController = require('../Controllers/ExamController');
const rateLimiter = require('../Middlewares/rateLimiter');
const authMiddleware = require('../Middlewares/authMiddleware'); 


router.post('/createExam', rateLimiter, ExamController.createExam);


router.get('/getFaqs', rateLimiter, ExamController.getExams);


router.get('/getUserHistorySummary/:user_id', ExamController.getUserHistorySummary);


// router.put('/updateExamStatus/:id', rateLimiter, ExamController.updateExamStatus);


router.delete('/deleteExam/:id', rateLimiter, ExamController.deleteExam);

module.exports = router;
