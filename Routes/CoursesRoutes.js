const express = require('express');
const router = express.Router();
const upload = require('../Config/Multer');
const CoursesController = require('../Controllers/CoursesController');
const rateLimit = require('../Middlewares/rateLimiter')



router.post('/addCourse', 
  (req, res, next) => {
    const uploadMiddleware = upload.fields([
      { name: 'img', maxCount: 1 },
      { name: 'defaultvideo', maxCount: 1 }, 
      { name: 'file_book', maxCount: 1 },
      { name: 'url', maxCount: 10 }
    ]);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Multer Error:', err);
        return res.status(400).json({
          error: 'File upload failed',
          details: err.message || JSON.stringify(err)
        });
      }
      next();
    });
  },
  rateLimit,
  CoursesController.addCourse
);



router.get('/',rateLimit, CoursesController.getcourses);
router.get('/details/:id',rateLimit, CoursesController.getCourseById);
router.delete('/deleteCourse/:id',rateLimit, CoursesController.deleteCourse);
router.get('/videos/:id',rateLimit, CoursesController.getCourseVideos);
router.get('/links/:id',CoursesController.getCourseLinks);

router.delete('/videos/:id',rateLimit, CoursesController.deleteVideoById);
router.get('/filter/:department_id/:teacher_email',rateLimit, CoursesController.getByDepartmentAndTeacher);
router.put('/:id',
  upload.fields([
    { name: 'img', maxCount: 10 },
    { name: 'defaultvideo', maxCount: 10 },
    { name: 'videoFiles', maxCount: 20 },
    { name: 'file_book', maxCount: 1 }
  ]), rateLimit,CoursesController.updateCourse);


  router.get('/users-counts/:id', CoursesController.getUserCountForCourse);
  router.get('/course-counts/:id',rateLimit, CoursesController.getCourseCountByTeacher);
  router.get('/lesson-counts/:id', CoursesController.getLessonCountForCourses);
  router.get('/getbydep/:id',rateLimit, CoursesController.getByDepartment);



module.exports = router;
