const express = require("express");
const router = express.Router();
const multer = require("../../Basma_New_Version/Config/Multer");
const AboutTeacherController = require("../Controllers/AboutTeacherController");
const authMiddleware = require("../Middlewares/authMiddleware");
const rateLimiter = require("../Middlewares/rateLimiter");


router.get("/getaboutteacher", AboutTeacherController.getAboutTeacher);


router.get("/getAboutTeacherById/:id", AboutTeacherController.getAboutTeacherById);

router.put(
  "/updateaboutTeacher/:id",
  rateLimiter,
  multer.single("img"), 
  AboutTeacherController.updateAboutTeacher
);


router.post(
  "/createaboutteacher",
  multer.single("img"),
  AboutTeacherController.createAboutTeacher
);


router.delete(
  "/deleteaboutteacher/:id",
  AboutTeacherController.deleteAboutTeacher
);

module.exports = router;
