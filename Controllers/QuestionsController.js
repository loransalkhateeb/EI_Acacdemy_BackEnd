
const Questions = require("../Models/QuestionsModel");
const { ErrorResponse } = require("../Utils/ValidateInput");
const { Sequelize } = require('sequelize');



exports.getQuestionsByCount = async (req, res) => {
    try {
        const { number_of_questions } = req.params;

        if (!number_of_questions || isNaN(number_of_questions)) {
            return res.status(400).json({
                message: "الرجاء إدخال عدد صحيح من الأسئلة"
            });
        }

        const questions = await Questions.findAll({
            attributes: ["id", "question_type", "question_text", "correct_answer", "explanation"],
            order: Sequelize.fn('RAND'), 
            limit: parseInt(number_of_questions),
        });

        res.status(200).json(questions);
    } catch (error) {
        console.error("Error in getQuestionsByCount:", error.message);
        res.status(500).json({
            message: "فشل في جلب الأسئلة",
            error: error.message,
        });
    }
};