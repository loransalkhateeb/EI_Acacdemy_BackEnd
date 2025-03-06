const express = require('express');
const router = express.Router();
const DepartmentController = require('../Controllers/DepartmentController'); 
const authMiddleWare = require('../Middlewares/authMiddleware'); 
const rateLimiter = require('../Middlewares/rateLimiter');


router.post('/createDepartment', rateLimiter, DepartmentController.createDepartment);


router.get('/getDepartments', rateLimiter, DepartmentController.getDepartments);


router.get('/getDepartment/:id', rateLimiter, DepartmentController.getDepartmentById);


router.put('/updateDepartment/:id', rateLimiter, DepartmentController.updateDepartment);


router.delete('/deleteDepartment/:id', rateLimiter, DepartmentController.deleteDepartment);

module.exports = router;
