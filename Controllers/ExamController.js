const { Op } = require('sequelize');
const Exam = require('../Models/Exam');
const Answer = require('../Models/AnswersModel'); 
const Question = require('../Models/QuestionsModel'); 
const { validateInput, ErrorResponse } = require("../Utils/ValidateInput");


exports.createExam = async (req, res) => {
    try {
      const { user_id, question_id, answer_id, mark } = req.body;
  
      const newExam = await Exam.create({
        user_id,
        question_id,
        answer_id, 
        mark
      });
  
      res.status(201).json(newExam);
    } catch (error) {
      console.error("Error in createExam:", error.message);
      res.status(500).json({ message: "Failed to create exam", error: error.message });
    }
  };
  


exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [
        {
          model: Question,
          attributes: ['question_type', 'question_text'] 
        },
        {
          model: Answer,
          attributes: ['answer_text', 'is_correct'] 
        }
      ]
    });

    res.mark(200).json(exams);
  } catch (error) {
    console.error("Error in getExams:", error.message);
    res.mark(500).json({ message: "Failed to fetch exams", error: error.message });
  }
};


exports.updateExammark = async (req, res) => {
  try {
    const { exam_id, mark } = req.body;

    if (!exam_id || !mark) {
      return res.mark(400).json({ message: "Exam ID and mark are required" });
    }


    if (!['Correct', 'Wrong'].includes(mark)) {
      return res.mark(400).json({ message: "mark must be 'Correct' or 'Wrong'" });
    }


    const exam = await Exam.findByPk(exam_id);

    if (!exam) {
      return res.mark(404).json({ message: "Exam not found" });
    }

    exam.mark = mark;
    await exam.save();

    res.mark(200).json(exam);
  } catch (error) {
    console.error("Error in updateExammark:", error.message);
    res.mark(500).json({ message: "Failed to update exam mark", error: error.message });
  }
};



exports.deleteExam = async (req, res) => {
  try {
    const { exam_id } = req.params;

    if (!exam_id) {
      return res.mark(400).json({ message: "Exam ID is required" });
    }

    const exam = await Exam.findByPk(exam_id);

    if (!exam) {
      return res.mark(404).json({ message: "Exam not found" });
    }

    await exam.destroy();
    res.mark(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error in deleteExam:", error.message);
    res.mark(500).json({ message: "Failed to delete exam", error: error.message });
  }
};




exports.getUserHistorySummary = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json(ErrorResponse("Validation failed", ["user_id is required"]));
    }

    const historyEntries = await Exam.findAll({
      attributes: ["id", "user_id", "question_id", "answer_id", "mark"],
      where: { user_id },
      order: [["mark", "DESC"]]
    });

    if (!historyEntries.length) {
      return res.status(404).json(ErrorResponse("No history found", ["No history entries found for this user."]));
    }

    const questionIds = historyEntries.map(entry => entry.question_id);
   
    const questions = await Question.findAll({
      attributes: ["id", "correct_answer", "question_text", "explanation", "question_type"],
      where: { id: questionIds }
    });

    const questionMap = new Map(questions.map(q => [
      q.id, 
      {
        correct_answer: q.correct_answer,
        question_text: q.question_text,
        explanation: q.explanation,
        question_type: q.question_type
      }
    ]));

    const answerIds = historyEntries.map(entry => entry.answer_id);
    const answers = await Answer.findAll({
      attributes: ["id", "answer_text"],
      where: { id: answerIds }
    });

    const answerMap = new Map(answers.map(a => [a.id, a.answer_text]));

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let incorrectQuestions = [];

    historyEntries.forEach(entry => {
      const userAnswerText = answerMap.get(entry.answer_id);
      const questionData = questionMap.get(entry.question_id) || {};

      if (entry.mark === 1) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
        incorrectQuestions.push({
          question_id: entry.question_id,
          user_answer: userAnswerText || "N/A",
          correct_answer: questionData.correct_answer || "Unknown",
          question_text: questionData.question_text || "N/A",
          explanation: questionData.explanation || "N/A",
          question_type: questionData.question_type || "N/A"
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
