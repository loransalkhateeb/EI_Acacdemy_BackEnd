const Student_History = require("../Models/Student_History");
const { client } = require("../Utils/redisClient");
const { validateInput, ErrorResponse } = require("../Utils/ValidateInput");

const { Op, Sequelize } = require("sequelize");
const Question = require("../Models/QuestionsModel"); 
const Answers = require("../Models/AnswersModel");


exports.createStudentHistory = async (req, res) => {
  try {
    const { user_id, question_id,answer_id, mark } = req.body || {};
    const { number_of_questions } = req.params; 

    if (!user_id ||!question_id ||!answer_id || mark === undefined) {
      return res.status(400).json(ErrorResponse("Validation failed", ["user_id, answer_id, and mark are required"]));
    }

  
    const numQuestions = parseInt(number_of_questions, 10);
    if (isNaN(numQuestions) || numQuestions <= 0) {
      return res.status(400).json(ErrorResponse("Validation failed", ["number_of_questions must be a positive integer"]));
    }


    const newHistory = await Student_History.create({
      user_id,
      question_id,
      answer_id,
      mark
    });
    

    res.status(200).json({
      message: "Questions Created successfully",
      newHistory
    });

  } catch (error) {
    console.error("Error in createStudentHistory:", error.message);
    res.status(500).json(
      ErrorResponse("Failed to retrieve questions", [
        "An internal server error occurred.",
      ])
    );
  }
};





exports.getStudentHistory = async (req, res) => {
  try {
    const { number_of_questions } = req.params; 
    
    
    if (!number_of_questions) {
      return res.status(400).json({
        message: "Please provide the number of questions."
      });
    }

   
    const historyEntries = await Student_History.findAll({
      attributes: ["id", "user_id", "question_id", "answer_id", "mark"], 
      include: [
        {
          model: Question, 
          attributes: ["question_type"], 
          required: true, 
        }
      ],
      order: Sequelize.fn('RAND'),
      limit: parseInt(number_of_questions), 
    });

    res.status(200).json(historyEntries); 
  } catch (error) {
    console.error("Error in getStudentHistory:", error.message);
    res
      .status(500)
      .json({
        message: "Failed to fetch student history entries",
        error: "An internal server error occurred.",
      });
  }
};







exports.getStudentHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `student_history:${id}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const historyEntry = await Student_History.findOne({
      attributes: ["id", "user_id", "question_id", "answer_id", "mark"],
      where: { id },
    });

    if (!historyEntry) {
      return res
        .status(404)
        .json(
          ErrorResponse("Student history entry not found", [
            "No student history entry found with the given ID.",
          ])
        );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(historyEntry));

    return res.status(200).json(historyEntry);
  } catch (error) {
    console.error("Error in getStudentHistoryById:", error);

    return res
      .status(500)
      .json(
        ErrorResponse("Failed to fetch student history entry", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};

exports.updateStudentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, question_id, answer_id, mark } = req.body;

    const validationErrors = validateInput({ user_id, question_id, answer_id, mark });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(ErrorResponse("Validation failed", validationErrors));
    }

    
    if (mark !== undefined && mark !== 0 && mark !== 1) {
      return res
        .status(400)
        .json(
          ErrorResponse("Validation failed", [
            "mark must be either 0 or 1",
          ])
        );
    }

    const historyEntry = await Student_History.findByPk(id);
    if (!historyEntry) {
      return res
        .status(404)
        .json(
          ErrorResponse("Student history entry not found", [
            "No student history entry found with the given ID.",
          ])
        );
    }

    const updatedFields = {};
    if (user_id && user_id !== historyEntry.user_id) updatedFields.user_id = user_id;
    if (question_id && question_id !== historyEntry.question_id) updatedFields.question_id = question_id;
    if (answer_id && answer_id !== historyEntry.answer_id) updatedFields.answer_id = answer_id;
    if (mark !== undefined && mark !== historyEntry.mark) updatedFields.mark = mark;

    if (Object.keys(updatedFields).length > 0) {
      await historyEntry.update(updatedFields);
    }

    const updatedData = historyEntry.toJSON();
    const cacheKey = `student_history:${id}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

   
    if (historyEntry.user_id) {
      await client.del(`student_history:user:${historyEntry.user_id}:page:1:limit:20`);
    }

    return res.status(200).json({
      message: "Student history entry updated successfully",
      historyEntry: updatedData,
    });
  } catch (error) {
    console.error("Error in updateStudentHistory:", error);

    return res
      .status(500)
      .json(
        ErrorResponse("Failed to update student history entry", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};

exports.deleteStudentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const historyEntry = await Student_History.findByPk(id);

    if (!historyEntry) {
      return res.status(404).json(
        ErrorResponse("Student history entry not found", [
          "No student history entry found with the given ID.",
        ])
      );
    }

    
    const userId = historyEntry.user_id;

   
    await Promise.all([
      historyEntry.destroy(),
      client.del(`student_history:${id}`)
    ]);

    
    if (userId) {
      await client.del(`student_history:user:${userId}:page:1:limit:20`);
    }

    return res.status(200).json({ message: "Student history entry deleted successfully" });
  } catch (error) {
    console.error("Error in deleteStudentHistory:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete student history entry", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};



exports.getUserHistorySummary = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json(ErrorResponse("Validation failed", ["user_id is required"]));
    }

   
    const historyEntries = await Student_History.findAll({
      attributes: ["id", "user_id", "question_id", "answer_id", "mark"],
      where: { user_id },
      order: [["mark", "DESC"]]
    });

    if (!historyEntries.length) {
      return res.status(404).json(ErrorResponse("No history found", ["No history entries found for this user."]));
    }

   
    const questionIds = historyEntries.map(entry => entry.question_id);
   
    const questions = await Question.findAll({
      attributes: ["id", "correct_answer"],
      where: { id: questionIds }
    });

    const questionMap = new Map(questions.map(q => [q.id, q.correct_answer]));

   
    const answerIds = historyEntries.map(entry => entry.answer_id);
    const answers = await Answers.findAll({
      attributes: ["id", "answer_text"],
      where: { id: answerIds }
    });

    const answerMap = new Map(answers.map(a => [a.id, a.answer_text]));

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let incorrectQuestions = [];

    historyEntries.forEach(entry => {
      const userAnswerText = answerMap.get(entry.answer_id); 

      if (entry.mark === 1) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
        incorrectQuestions.push({
          question_id: entry.question_id,
          user_answer: userAnswerText, 
          correct_answer: questionMap.get(entry.question_id) || "Unknown"
        });
      }
    });

    const totalQuestions = historyEntries.length;
    const successRate = (correctAnswers / totalQuestions) * 100;
    const failRate = (incorrectAnswers / totalQuestions) * 100;

   
    let feedback;
    if (successRate >= 90) {
      feedback = "Excellent! Keep up the great work!";
    } else if (successRate >= 75) {
      feedback = "Very good! Just a few mistakes to improve.";
    } else if (successRate >= 50) {
      feedback = "Good effort! Focus more on weak areas.";
    } else {
      feedback = "Needs improvement. Review the material carefully.";
    }

    const summary = {
      user_id: parseInt(user_id),
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      successRate: parseFloat(successRate.toFixed(2)),
      failRate: parseFloat(failRate.toFixed(2)),
      feedback,
      incorrectQuestions
    };

    return res.status(200).json(summary);

  } catch (error) {
    console.error("Error in getUserHistorySummary:", error);
    return res.status(500).json(ErrorResponse("Failed to fetch user history summary", ["An internal server error occurred."]));
  }
};


