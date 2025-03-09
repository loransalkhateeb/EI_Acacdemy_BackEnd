const { Op } = require('sequelize');
const Exam = require('../Models/Exam');
const Answer = require('../Models/AnswersModel'); 
const Question = require('../Models/QuestionsModel'); 
const { validateInput, ErrorResponse } = require("../Utils/ValidateInput");
const Student_History = require('../Models/Student_History');



exports.createExam = async (req, res) => {
  try {
    const { user_id, question_id, answers } = req.body;

    
    const question = await Question.findByPk(question_id, {
      attributes: ['id', 'correct_answer']
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers must be a non-empty array"
      });
    }

    let correctAnswersArray;
    try {
      
      correctAnswersArray = JSON.parse(question.correct_answer);
      if (!Array.isArray(correctAnswersArray)) {
        throw new Error("Incorrect format");
      }
    } catch (error) {
      
      correctAnswersArray = question.correct_answer.split(',').map(ans => ans.trim());
    }
    
    const isCorrect = answers.length === correctAnswersArray.length &&
                      answers.every((ans, index) => ans.answer_text.trim() === correctAnswersArray[index].trim());
    
    const mark = isCorrect ? 1 : 0;
    
    const newExam = await Exam.create({ 
      user_id, 
      question_id, 
      answers: answers, 
      mark
    });


    const newHistory = await Student_History.create({ 
      user_id, 
      question_id, 
      answers: answers, 
      mark
    });

    res.status(201).json({
      success: true,
      mark,
      isCorrect,
      exam: newExam,
      history:newHistory
    });

  } catch (error) {
    console.error("Error in createExam:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to create exam", 
      error: error.message 
    });
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
      attributes: ["id", "user_id", "question_id", "answers", "mark"],
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
    if (successRate >= 95) {
      feedback = {
        level: "Exceptional Mastery",
        message: "Flawless performance! You've mastered the material completely 🏅",
        icon: "🎯",
        recommendation: "Challenge yourself with advanced topics and competitions"
      };
    } else if (successRate >= 85) {
      feedback = {
        level: "Advanced Proficiency",
        message: "Outstanding results! Maintain excellence with minor refinements 💎",
        icon: "✨", 
        recommendation: "Analyze rare mistakes and optimize time management"
      };
    } else if (successRate >= 75) {
      feedback = {
        level: "Strong Competence",
        message: "Solid performance! You have a good foundation with room for growth 📘",
        icon: "🔍",
        recommendation: "Review error patterns and practice similar questions"
      };
    } else if (successRate >= 60) {
      feedback = {
        level: "Developing Understanding",
        message: "Foundation building! Focus on core concepts needing improvement 💡",
        icon: "🛠️",
        recommendation: "Use study guides and re-attempt incorrect questions"
      };
    } else if (successRate >= 45) {
      feedback = {
        level: "Emerging Skills",
        message: "Progress needed! Dedicate consistent study time daily ⏳",
        icon: "📌",
        recommendation: "Start with high-yield topics and join study groups"
      };
    } else if (successRate >= 30) {
      feedback = {
        level: "Basic Awareness",
        message: "Requires urgent attention! Rebuild fundamentals from scratch 🚨",
        icon: "⚠️",
        recommendation: "Use alternative learning resources and increase study hours"
      };
    } else {
      feedback = {
        level: "Critical Support Needed",
        message: "Immediate intervention required! Contact instructor for rescue plan 🆘",
        icon: "🚑",
        recommendation: "Schedule one-on-one tutoring and weekly progress reviews"
      };
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
