const express = require('express');
const router = express.Router();
const StudentHistoryController = require('../Controllers/StudentHistoryController');
const rateLimiter = require('../Middlewares/rateLimiter');


router.post('/createHistory/:number_of_questions', rateLimiter, StudentHistoryController.createStudentHistory);


router.get('/getStudentHistory/:number_of_questions', StudentHistoryController.getStudentHistory);


router.get('/getbyid/:id', StudentHistoryController.getStudentHistoryById);


router.get('/getUserHistorySummary/:user_id', StudentHistoryController.getUserHistorySummary);


router.put('/update/:id', rateLimiter, StudentHistoryController.updateStudentHistory);


router.delete('/delete/:id', StudentHistoryController.deleteStudentHistory);

module.exports = router;