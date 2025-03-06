const express = require('express');
const router = express.Router();
const libraryController = require('../Controllers/LibraryController');
const rateLimiter = require('../Middlewares/rateLimiter');
const authMiddleware = require('../Middlewares/authMiddleware');
const upload = require('../Config/Multer'); 

router.post('/createLibrary', 
    rateLimiter, 
    upload.single('file_book'),  
    libraryController.createLibrary  
  );

router.get('/getLibraries', rateLimiter, libraryController.getLibrary);

router.get('/getLibrary/:id', rateLimiter, libraryController.getLibraryById);

router.get('/getFile/:filename',rateLimiter,libraryController.getByFile)
router.get('/getbydep/:id',rateLimiter,libraryController.getByDepartment)

router.put('/updateLibrary/:id', rateLimiter, upload.single('file_book'), libraryController.updateLibrary);

router.delete('/deleteLibrary/:id', rateLimiter, libraryController.deleteLibrary);

module.exports = router;
