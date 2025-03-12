const xlsx = require("xlsx");
const TestBank = require("../Models/TestBankModel");
const Unit = require("../Models/UnitModel");
const Topic = require("../Models/TopicsModel");
const Questions = require("../Models/QuestionsModel");
const Answers = require("../Models/AnswersModel");
const axios = require("axios");
const { ErrorResponse } = require("../Utils/ValidateInput");

const { Op } = require('sequelize');




exports.addTestBank = async (req, res) => {
  const { testBankCourse_name, semester, description, before_price, after_price, image, video, excelsheet } = req.body;

  console.log("Excel File:", req.files.excelsheet);
  console.log("Image File:", req.files.image);
  console.log("Video File:", req.files.video);

  
  if (!req.files || !req.files.excelsheet || !req.files.image || !req.files.video) {
    return res.status(400).json({ error: "One or more files are missing!" });
  }

  try {
    const excelsheetFile = req.files.excelsheet[0];  
    const imageFile = req.files.image[0];  
    const videoFile = req.files.video[0]; 

    console.log("Excel File:", excelsheetFile);
    console.log("Image File:", imageFile);
    console.log("Video File:", videoFile);

   
    const excelsheetPath = excelsheetFile ? excelsheetFile.path : "";
    const imagePath = imageFile ? imageFile.path : "";
    const videoPath = videoFile ? videoFile.path : "";

    
    const [course] = await TestBank.findOrCreate({
      where: { testBankCourse_name, semester },
      defaults: {
        testBankCourse_name,
        semester,
        description: description || "",
        before_price: before_price || 0,
        after_price: after_price || 0,
        image: imagePath,  
        video: videoPath,  
        excelsheet: excelsheetPath, 
      },
    });

    const fileUrl = excelsheetFile.path;
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const workbook = xlsx.read(response.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    await insertData(data);

    res.status(200).json({ message: "File processed and data inserted successfully!" });

  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).json({ error: "Something went wrong while processing the file." });
  }
};





async function insertData(data) {
  for (const row of data) {
    const {
      المادة: courseName,
      "الفصل الدراسي": semester,
      "الوحدة/الفصل": unitName,
      الموضوع: topicName,
      السؤال: questionText,
      "نوع السؤال": question_type,
      "الإجابة الصحيحة": correctAnswer,
      "شرح أو خطوات الحل": explanation,
      "الإختيار الأول A": answerA,
      "الإختيار الثاني B": answerB,
      "الإختيار الثالث C": answerC,
      "الاختيار الرابع D": answerD,
    } = row;

    try {
      // Ensure values are not undefined
      if (
        !courseName ||
        !semester ||
        !unitName ||
        !topicName ||
        !questionText
      ) {
        console.warn("Skipping row due to missing values:", row);
        continue;
      }

      // Insert course if not exists
      const [course] = await TestBank.findOrCreate({
        where: { testBankCourse_name: courseName, semester },
        defaults: { testBankCourse_name: courseName, semester },
      });

      // Insert unit if not exists
      const [unit] = await Unit.findOrCreate({
        where: { unit_name: unitName, testBank_id: course.id },
        defaults: { unit_name: unitName, testBank_id: course.id },
      });

      if (!unit || !unit.id) {
        console.error("Failed to retrieve unit ID:", unit);
        continue;
      }

      // Insert topic if not exists
      const [topic] = await Topic.findOrCreate({
        where: { topic_name: topicName, unit_id: unit.id },
        defaults: { topic_name: topicName, unit_id: unit.id },
      });

      if (!topic || !topic.id) {
        console.error("Failed to retrieve topic ID:", topic);
        continue;
      }

      // Insert question
      const question = await Questions.create({
        question_text: questionText,
        question_type,
        correct_answer: correctAnswer,
        explanation,
        topic_id: topic.id,
      });
      if (question_type !== "كتابة") {
        await Answers.bulkCreate(
          [
            answerA && { answer_text: answerA, answer_id: "A", question_id: question.id },
            answerB && { answer_text: answerB, answer_id: "B", question_id: question.id },
            answerC && { answer_text: answerC, answer_id: "C", question_id: question.id },
            answerD && { answer_text: answerD, answer_id: "D", question_id: question.id },
          ].filter(Boolean) // Remove any undefined values
        );
      }
      console.log(`Inserted question for topic: ${topicName}`);
    } catch (error) {
      console.error("Error inserting data:", error);
   }
  }
}



exports.getTestBank = async (req, res) => {
  try {
    // Fetch all courses with their associated units, topics, questions, and answers
    const courses = await TestBank.findAll({
      include: {
        model: Unit,
        include: {
          model: Topic,
          include: {
            model: Questions,
            include: {
              model: Answers,
            },
          },
        },
      },
    });

    // Return the data as JSON
    res.json(courses);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching courses!" });
  }
};
exports.getTestBankById = async (req, res) => {
  try {
    const { id } = req.params;
    const testBank = await TestBank.findByPk(id, {
      include: {
        model: Unit,
        include: {
          model: Topic,
          include: {
            model: Questions,
            include: {
              model: Answers,
            },
          },
        },
      },
    });
    if (!testBank) {
      return res
        .status(404)
        .json(
          ErrorResponse("testBank not found", [
            `No testBank found with the given ID: ${id}`,
          ])
        );
    }
    res.status(200).json([testBank]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        ErrorResponse("Failed to fetch testBank", [
          "An error occurred while fetching the testBank.",
        ])
      );
  }
};



exports.getTestBankById = async (req, res) => {
  try {
    const { id } = req.params;
    const testBank = await TestBank.findByPk(id, {
      include: {
        model: Unit,
        include: {
          model: Topic,
          include: {
            model: Questions,
            include: {
              model: Answers,
            },
          },
        },
      },
    });
    if (!testBank) {
      return res
        .status(404)
        .json(
          ErrorResponse("testBank not found", [
            `No testBank found with the given ID: ${id}`,
          ])
        );
    }
    res.status(200).json([testBank]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        ErrorResponse("Failed to fetch testBank", [
          "An error occurred while fetching the testBank.",
        ])
      );
  }
};




exports.getTestBankByIdByNumberOfQuestions = async (req, res) => { 
  try {
    const { id, number_of_questions,user_id } = req.params;


    
    if (!number_of_questions || isNaN(number_of_questions)) {
      return res.status(400).json({
        message: "Please enter a valid number of questions",
      });
    }

    
    const existingExams = await Exam.findAll({ 
      where: { user_id }
    });
    
    if (existingExams.length > 0) {
      await Exam.destroy({
        where: { user_id }
      });
      console.log(`Deleted ${existingExams.length} previous exam records for user ${user_id}`);
    }

    
    const testBank = await TestBank.findByPk(id, {
      include: {
        model: Unit,
        include: {
          model: Topic,
          include: {
            model: Questions,
            attributes: ["id", "question_text", "question_type", "explanation"],
            include: {
              model: Answers,
            },
          },
        },
      },
    });

    
    if (!testBank) {
      return res.status(404).json({
        message: `No testBank found with the given ID: ${id}`,
      });
    }

    
    let allQuestions = [];
    testBank.Units.forEach(unit => {
      unit.Topics.forEach(topic => {
        allQuestions = allQuestions.concat(topic.Questions); 
      });
    });

    
    if (allQuestions.length < number_of_questions) {
      return res.status(400).json({
        message: "Not enough questions available",
      });
    }
   
    const selectedIds = new Set();
    const randomQuestions = [];
    
    while (randomQuestions.length < parseInt(number_of_questions)) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      const question = allQuestions[randomIndex];
    
      if (!selectedIds.has(question.id)) {
        selectedIds.add(question.id);
        randomQuestions.push(question);
      }
    }
    
    
    res.status(200).json(randomQuestions);
  } catch (error) {
    console.error("Error in getTestBankByIdByNumberOfQuestions:", error.message);
    res.status(500).json({
      message: "فشل في جلب بنك الاختبار",
      error: error.message,
    });
  }
};





exports.getTopicsByTestBankId = async (req, res) => {
  try {
    const { testBank_id } = req.params;

   
    if (!testBank_id) {
      return res.status(400).json({
        message: "يرجى تقديم معرف بنك الاختبار",
      });
    }

    
    const units = await Unit.findAll({
      where: { testBank_id },
      attributes: ['id'],
    });

    
    if (!units || units.length === 0) {
      return res.status(404).json({
        message: `لم يتم العثور على وحدات لبنك الاختبار بالمعرف: ${testBank_id}`,
      });
    }

   
    const unitIds = units.map(unit => unit.id);

   
    const topics = await Topic.findAll({
      where: {
        unit_id: {
          [Op.in]: unitIds,
        },
      },
      attributes: ['id', 'topic_name', 'unit_id'], 
      order: [
        ['unit_id', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    
    if (!topics || topics.length === 0) {
      return res.status(404).json({
        message: `لم يتم العثور على مواضيع للوحدات المرتبطة ببنك الاختبار بالمعرف: ${testBank_id}`,
      });
    }

  
    res.status(200).json(topics);
  } catch (error) {
    console.error("خطأ في getTopicsByTestBankId:", error.message);
    res.status(500).json({
      message: "فشل في جلب المواضيع لبنك الاختبار",
      error: error.message,
    });
  }
};






exports.getTestBankByTopicIdByNumberOfQuestions = async (req, res) => { 
  try {
    const { topic_id, number_of_questions, user_id, question_type } = req.params;

    
    if (!number_of_questions || isNaN(number_of_questions)) {
      return res.status(400).json({
        message: "الرجاء إدخال عدد صحيح للأسئلة",
      });
    }

   
    if (question_type !== "repeated" && question_type !== "non_repeated") {
      return res.status(400).json({
        message: "نوع الأسئلة يجب أن يكون 'repeated' أو 'non_repeated'",
      });
    }

    
    const existingExams = await Exam.findAll({ 
      where: { user_id }
    });
    
    if (existingExams.length > 0) {
      await Exam.destroy({
        where: { user_id }
      });
      console.log(`تم حذف ${existingExams.length} سجل امتحان سابق للمستخدم ${user_id}`);
    }

    
    const topic = await Topic.findByPk(topic_id, {
      include: {
        model: Questions,
        attributes: ["id", "question_text", "question_type","correct_answer","explanation"],
        include: {
          model: Answers,
        },
      },
    });

    
    if (!topic) {
      return res.status(404).json({
        message: `لم يتم العثور على موضوع بالمعرف المقدم: ${topic_id}`,
      });
    }

   
    let allQuestions = [...topic.Questions];
    
   
    if (question_type === "non_repeated") {
      
      const studentHistory = await Student_History.findAll({
        where: { user_id },
        attributes: ['question_id']
      });
      
     
      const answeredQuestionIds = studentHistory.map(record => record.question_id);
      
      
      if (answeredQuestionIds.length > 0) {
        allQuestions = allQuestions.filter(question => !answeredQuestionIds.includes(question.id));
        console.log(`تم استبعاد ${answeredQuestionIds.length} سؤال من تاريخ الطالب`);
      }
    }

   
    if (allQuestions.length < number_of_questions) {
      return res.status(400).json({
        message: "لا يوجد عدد كافي من الأسئلة المتاحة بعد استبعاد الأسئلة المُجابة سابقاً",
      });
    }
   
   
    const selectedIds = new Set();
    const randomQuestions = [];
    
    while (randomQuestions.length < parseInt(number_of_questions)) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      const question = allQuestions[randomIndex];
    
      if (!selectedIds.has(question.id)) {
        selectedIds.add(question.id);
        randomQuestions.push(question);
      }
    }
    
    
    res.status(200).json(randomQuestions);
  } catch (error) {
    console.error("خطأ في getTestBankByTopicIdByNumberOfQuestions:", error.message);
    res.status(500).json({
      message: "فشل في جلب أسئلة الموضوع",
      error: error.message,
    });
  }
};


exports.deleteTestBank = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    console.log(`Starting deletion process for TestBank ID: ${id}`);
    
    
    const units = await Unit.findAll({ where: { testBank_id: id } });
    const unitIds = units.map(unit => unit.id);
    console.log(`Found ${unitIds.length} units to delete for TestBank ID: ${id}`);
    
   

    const deletedPayments = await Payment.destroy({ where: { testBank_id: id } });
    console.log(`Deleted ${deletedPayments} payment records`);

    const deletedCourseUsers = await course_users.destroy({ where: { testBank_id: id } });
    console.log(`Deleted ${deletedCourseUsers} course user records`);

    const topics = await Topic.findAll({ where: { unit_id: unitIds } });
    const topicIds = topics.map(topic => topic.id);
    console.log(`Found ${topicIds.length} topics to delete`);
    
  
    const questions = await Questions.findAll({ where: { topic_id: topicIds } });
    const questionIds = questions.map(question => question.id);
    console.log(`Found ${questionIds.length} questions to delete`);
    
    if (questionIds.length > 0) {
      
      const deletedExams = await Exam.destroy({ where: { question_id: questionIds } });
      console.log(`Deleted ${deletedExams} exam records`);
      
     
      const deletedHistory = await Student_History.destroy({ where: { question_id: questionIds } });
      console.log(`Deleted ${deletedHistory} student history records`);
      
      
      const deletedAnswers = await Answers.destroy({ where: { question_id: questionIds } });
      console.log(`Deleted ${deletedAnswers} answer records`);
      
      
      const deletedQuestions = await Questions.destroy({ where: { id: questionIds } });
      console.log(`Deleted ${deletedQuestions} questions`);
    }
    
    if (topicIds.length > 0) {
      
      const deletedTopics = await Topic.destroy({ where: { id: topicIds } });
      console.log(`Deleted ${deletedTopics} topics`);
    }
    
    if (unitIds.length > 0) {
     
      const deletedUnits = await Unit.destroy({ where: { id: unitIds } });
      console.log(`Deleted ${deletedUnits} units`);
    }
    
  
    const deletedTestBank = await TestBank.destroy({ where: { id: id } });
    console.log(`Deleted TestBank with ID: ${id}`);

    if (deletedTestBank === 0) {
      return res
        .status(404)
        .json({ error: "TestBank not found or already deleted" });
    }

    res.json({ 
      message: "TestBank and all related data deleted successfully",
      summary: {
        testBankId: id,
        unitsDeleted: unitIds.length,
        topicsDeleted: topicIds.length,
        questionsDeleted: questionIds.length
      }
    });
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).json({ error: error.message });
  }
};



//QUESTIOS
exports.getQuestionsById = async (req, res) => {
  try {
    const { topic_id } = req.params;
    const testBank = await Questions.findAll({
      where: { topic_id },
      include: {
        model: Answers,
      },
    });
    if (!testBank) {
      return res
        .status(404)
        .json(
          ErrorResponse("testBank not found", [
            `No testBank found with the given ID: ${topic_id}`,
          ])
        );
    }
    res.status(200).json(testBank);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        ErrorResponse("Failed to fetch testBank", [
          "An error occurred while fetching the testBank.",
        ])
      );
  }
};

const { Sequelize } = require('sequelize');
const Exam = require("../Models/Exam");
const Student_History = require("../Models/Student_History");
const Payment = require("../Models/PaymentsModel");
const course_users = require("../Models/course_users");


exports.getQuestionsByQuestionCount = async (req, res) => {
  try {
    const { questionCount } = req.params;

    const questions = await Questions.findAll({
      attributes: ["id", "question_text", "question_type"],
      include: [
        {
          model: Answers,
          attributes: ["id", "answer_text"],
          required: true
        }
      ],
      order: Sequelize.fn('RAND'),
      limit: questionCount
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions available",
        error: "Question bank is empty"
      });
    }

    const formattedQuestions = questions.map(question => ({
      id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      answers: question.answers
    }));

    res.status(200).json({
      success: true,
      message: "Questions retrieved successfully",
      count: formattedQuestions.length,
      data: formattedQuestions
    });

  } catch (error) {
    console.error("Error in getQuestionsByQuestionCount:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: "Internal server error occurred"
    });
  }
};