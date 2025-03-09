const xlsx = require("xlsx");
const TestBank = require("../Models/TestBankModel");
const Unit = require("../Models/UnitModel");
const Topic = require("../Models/TopicsModel");
const Questions = require("../Models/QuestionsModel");
const Answers = require("../Models/AnswersModel");
const axios = require("axios");
const { ErrorResponse } = require("../Utils/ValidateInput");

exports.addTestBank = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    const fileUrl = req.file.path; // Use .path to get the Cloudinary file URL
    console.log("File URL:", fileUrl); // Debugging

    // Download the file using axios
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

    // Read the Excel file from the buffer
    const workbook = xlsx.read(response.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Process and insert data into the database
    await insertData(data);

    res
      .status(200)
      .json({ message: "File processed and data inserted successfully!" });
  } catch (err) {
    console.error("Error processing file:", err);
    res
      .status(500)
      .json({ error: "Something went wrong while processing the file." });
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