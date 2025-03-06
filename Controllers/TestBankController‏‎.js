const xlsx = require("xlsx");
const TestBank = require("../Models/TestBankModel");
const Unit = require("../Models/UnitModel");
const Topic = require("../Models/TopicsModel");
const Questions = require("../Models/QuestionsModel");
const Answers = require("../Models/AnswersModel");
const axios = require("axios");
const { ErrorResponse } = require("../Utils/ValidateInput");
const { client } = require("../Utils/redisClient");

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

exports.deleteTestBank = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    await Unit.destroy({ where: { testBank_id: id } });
    await Topic.destroy({ where: { unit_id: id } });
    await Questions.destroy({ where: { topic_id: id } });
    await Answers.destroy({ where: { question_id: id } });

    const deletedTestBank = await TestBank.destroy({ where: { id: id } });

    if (deletedTestBank === 0) {
      return res
        .status(404)
        .json({ error: "TestBank not found or already deleted" });
    }

    res.json({ message: "TestBank and all related data deleted successfully" });
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