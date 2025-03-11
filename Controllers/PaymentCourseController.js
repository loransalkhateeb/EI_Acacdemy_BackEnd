const { Op } = require("sequelize");
const { client } = require("../Utils/redisClient");
const asyncHandler = require("../Middlewares/asyncHandler");

const Sequelize = require("../Config/dbConnect");

const Course = require("../Models/Courses");
const Coupon = require("../Models/CouponsModel");
const Payment = require("../Models/PaymentsModel");
const CourseUser = require("../Models/course_users");
const Department = require("../Models/DepartmentModel");
const Teacher = require("../Models/TeacherModel");
const courses = require("../Models/Courses");
const TestBank = require("../Models/TestBankModel");
const Unit = require("../Models/UnitModel");
const Topic = require("../Models/TopicsModel");



exports.validateCouponCode = asyncHandler(async (req, res, next) => {
  const { coupon_code, course_id, testBank_id } = req.body;

  
  if (!coupon_code || (!course_id && !testBank_id)) {
    return res
      .status(400)
      .json({ error: "Coupon code and either course ID or testBank ID are required" });
  }

  try {
    const currentDateTime = new Date();

    const coupon = await Coupon.findOne({
      attributes: ["id", "coupon_type", "course_id", "testBank_id"],
      where: {
        coupon_code,
        expiration_date: {
          [Op.gt]: currentDateTime,
        },
        used: false,
      },
    });

    if (!coupon) {
      return res.status(400).json({ error: "Invalid or expired coupon code" });
    }

    
    if (coupon.coupon_type === "course" && course_id && coupon.course_id !== course_id) {
      return res
        .status(400)
        .json({ error: "Coupon is not valid for this course" });
    }

    if (coupon.coupon_type === "testBank" && testBank_id && coupon.testBank_id !== testBank_id) {
      return res
        .status(400)
        .json({ error: "Coupon is not valid for this test bank" });
    }

    res.status(200).json({
      message: "Coupon code is valid",
      couponId: coupon.id,
      couponType: coupon.coupon_type,
    });
  } catch (error) {
    console.error("Error validating coupon code:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// exports.buyCourse = asyncHandler(async (req, res) => {
//   const { student_name, email, address, phone, course_id, coupon_code, user_id } = req.body;


//   if (!student_name || !email || !address || !phone || !user_id) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   const currentDateTime = new Date();

//   try {
   
//     const coupon = await Coupon.findOne({
//       where: {
//         coupon_code,
//         expiration_date: { [Op.or]: [{ [Op.is]: null }, { [Op.gt]: currentDateTime }] }, 
//         used: false, 
//         coupon_type: 'course', 
//       },
//     });

//     if (!coupon) {
//       return res.status(400).json({ error: "Invalid or expired coupon code" });
//     }

   
//     const course = await Course.findByPk(course_id, { attributes: ['id'] });
//     if (!course) {
//       return res.status(400).json({ error: "Course not found" });
//     }

    
//     if (coupon.coupon_type === 'course' && coupon.course_id !== course_id) {
//       return res.status(400).json({ error: "Coupon is not valid for this course" });
//     }

   
//     const payment = await Payment.create({
//       student_name,
//       email,
//       address,
//       phone,
//       course_id, 
//       coupon_id: coupon.id,
//       user_id,
//     });
   
//     await coupon.update({ used: true });

    
//     const paymentStatus = "approved";  
//     await CourseUser.create({
//       user_id,
//       course_id,
//       payment_id: payment.id,
//       payment_status: paymentStatus,  
//     });

    
//     await client.del('courses');
//     await client.setEx('courses', 3600, JSON.stringify(await Course.findAll()));

  
//     res.status(200).json({ message: "Course purchased successfully" });

//   } catch (error) {
//     console.error("Error processing course purchase:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });





exports.buyCourse = asyncHandler(async (req, res) => {
  const { student_name, email, address, phone, course_id, testBank_id, coupon_code, user_id } = req.body;

 
  if (!student_name || !email || !address || !phone || !user_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  
  if (!course_id && !testBank_id) {
    return res.status(400).json({ error: "At least one of course_id or testBank_id is required" });
  }

  const currentDateTime = new Date();

  try {
    let coupon = null;

    
    if (coupon_code) {
      coupon = await Coupon.findOne({
        where: {
          coupon_code,
          expiration_date: { [Op.or]: [{ [Op.is]: null }, { [Op.gt]: currentDateTime }] },
          used: false,
          coupon_type: { [Op.in]: ['course', 'department', 'testBank','courseandtestbank'] }, 
        }
      });

      if (!coupon) {
        return res.status(400).json({ error: "Invalid or expired coupon code" });
      }
    }

    
    if (course_id) {
      const course = await Course.findByPk(course_id, { attributes: ['id'] });
      if (!course) {
        return res.status(400).json({ error: "Course not found" });
      }

      if (coupon && coupon.coupon_type === 'course' && coupon.course_id !== course_id) {
        return res.status(400).json({ error: "Coupon is not valid for this course" });
      }
    }

   
    if (testBank_id) {
      const testBank = await TestBank.findByPk(testBank_id, { attributes: ['id'] });
      if (!testBank) {
        return res.status(400).json({ error: "Test bank not found" });
      }

      if (coupon && coupon.coupon_type === 'testBank' && coupon.testBank_id !== testBank_id) {
        return res.status(400).json({ error: "Coupon is not valid for this test bank" });
      }
    }

    
    const payment = await Payment.create({
      student_name,
      email,
      address,
      phone,
      course_id: course_id || null,
      testBank_id: testBank_id || null,
      coupon_id: coupon ? coupon.id : null,
      user_id,
    });

    
    if (coupon) {
      await coupon.update({ used: true });
    }

   
    const paymentStatus = "approved";

   
    if (course_id && testBank_id) {
     
      await CourseUser.create({
        user_id,
        course_id,
        testBank_id,  
        payment_id: payment.id,
        payment_status: paymentStatus,
      });
    } else if (course_id) {
     
      await CourseUser.create({
        user_id,
        course_id,
        payment_id: payment.id,
        payment_status: paymentStatus,
      });
    } else if (testBank_id) {
  
      await CourseUser.create({
        user_id,
        testBank_id,  
        payment_id: payment.id,
        payment_status: paymentStatus,
      });
    }
    
    
    let successMessage = "Purchase successful.";
    if (course_id && testBank_id) {
      successMessage = "Course and test bank purchased successfully.";
    } else if (course_id) {
      successMessage = "Course purchased successfully.";
    } else if (testBank_id) {
      successMessage = "Test bank purchased successfully.";
    }

    res.status(200).json({ message: successMessage });

  } catch (error) {
    console.error(`Error processing purchase:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





exports.getApprovedCoursesForUser = asyncHandler(async (req, res, next) => {
  const { user_id } = req.params;

  try {

    await client.del(`approved_courses_${user_id}`);


    const cachedCourses = await client.get(`approved_courses_${user_id}`);
    if (cachedCourses) {
      return res.status(200).json(JSON.parse(cachedCourses));
    }


    const courses = await CourseUser.findAll({
      where: {
        user_id,
        payment_status: "approved",
      },
      include: [
        {
          model: Payment,
          attributes: ["id", "coupon_id"],
          include: [
            {
              model: Coupon,
              where: { expiration_date: { [Op.gte]: new Date() } },
            },
          ],
        },
        {
          model: Course,
          include: [
            {
              model: Teacher,
              attributes: ["id", "teacher_name", "descr", "email"],
            },
            {
              model: Department,
              attributes: ["id", "title", "price"],
            },
          ],
        },
        {
          model: TestBank,
          attributes: ["id", "testBankCourse_name", "semester"],
          include: [
            {
              model: Unit,
              attributes: ["id", "unit_name", "testBank_id"],
              include: [
                {
                  model: Topic,
                  attributes: ["id", "topic_name"],
                },
              ],
            },
          ],
        },
      ],
    });

    
    await client.setEx(
      `approved_courses_${user_id}`,
      3600,
      JSON.stringify(courses)
    );

   
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching approved courses:", error);
    return res.status(500).json({ error: "Database error" });
  }
});

