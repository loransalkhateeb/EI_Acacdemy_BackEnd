const express = require("express");
const router = express.Router();
const BlogController = require("../Controllers/BlogController");
const multer = require('../Config/Multer')


const rateLimiter = require('../Middlewares/rateLimiter');


router.post('/create-blog', rateLimiter,multer.single('img'), BlogController.createBlog);


router.get('/All-blogs', rateLimiter, BlogController.getAllBlogs);


router.get('/getBlogById/:id', rateLimiter, BlogController.getBlogById);
router.get('/lastthree', rateLimiter, BlogController.getLastThreeBlogs);


router.put('/update-blog/:id', rateLimiter,multer.single('img'), BlogController.updateBlog);
router.put("/updateActionBlogs/:id", BlogController.updateActionBlogs); 


router.delete('/delete-blog/:id', rateLimiter,  BlogController.deleteBlog);

module.exports = router;
