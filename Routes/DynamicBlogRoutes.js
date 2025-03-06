const express = require('express');
const router = express.Router();
const dynamicBlogController = require('../Controllers/DynamicBlogController');
const rateLimiter = require('../Middlewares/rateLimiter');
const authMiddleware = require('../Middlewares/authMiddleware'); 


router.post('/createDynamicBlog', rateLimiter, dynamicBlogController.addDynamicBlog);


router.get('/getDynamicBlogs', rateLimiter, dynamicBlogController.getDynamicBlogs);


router.get('/getDynamicBlog/:id', rateLimiter, dynamicBlogController.getDynamicBlogById);


router.put('/updateDynamicBlog/:id', rateLimiter, dynamicBlogController.updateDynamicBlog);


router.delete('/deleteDynamicBlog/:id', rateLimiter, dynamicBlogController.deleteDynamicBlog);

module.exports = router;
