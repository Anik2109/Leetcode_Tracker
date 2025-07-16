import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Question } from "../models/question.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const giveTopics = asyncHandler(async (req, res) => {
  
  let { topic, status, difficulty } = req.params;

  if (!topic) topic = "Array";
  if (status === "null") status = null;
  if (difficulty === "null") difficulty = null;

  

  // Step 1: Build query
  const query = { topics: topic };
  if (difficulty) query.difficulty = difficulty;

  const questions = await Question.find(query);
  if (!questions || questions.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No questions found for this topic"));
  }

  // Step 2: Fetch user's solved problems
  const userId = req.user.id;
  const user = await User.findById(userId).select("solvedProblems");
  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  const solvedSet = new Set(
    user.solvedProblems.map((entry) => entry.question.toString())
  );

  // Step 3: Annotate questions
    let annotatedQuestions = questions.map((q) => {
      const isSolved = solvedSet.has(q._id.toString());
      return {
        ...q.toObject(),
        solved: isSolved
      };
    });


  // Step 4: Apply status filter
  if (status === "solved") {
    annotatedQuestions = annotatedQuestions.filter((q) =>
      solvedSet.has(q._id.toString())
    );
  } else if (status === "unsolved") {
    annotatedQuestions = annotatedQuestions.filter(
      (q) => !solvedSet.has(q._id.toString())
    );
  }

  // Step 5: Count solved questions
  const solvedCount = annotatedQuestions.reduce(
    (count, q) => count + (q.solved !== false ? 1 : 0),
    0
  );

  return res.status(200).json(
    new ApiResponse(200, "Questions fetched successfully", {
      total: annotatedQuestions.length,
      solvedCount,
      questions: annotatedQuestions
    })
  );
});

const giveCompany = asyncHandler(async (req, res) => {
  let { company, status, difficulty } = req.params;

  if (!company || company=="null") company = "Amazon";
  if (!status || status === "null") status = null;
  if (!difficulty || difficulty === "null") difficulty = null;

  // Step 1: Build query
  const query = { companyTags: company };
  if (difficulty) query.difficulty = difficulty;
  
  
  const questions = await Question.find(query);
  

  
  if (!questions || questions.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No questions found for this company"));
  }

  // Step 2: Fetch user's solved problems
  const userId = req.user.id;
  const user = await User.findById(userId).select("solvedProblems");
  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  const solvedSet = new Set(
    user.solvedProblems.map((entry) => entry.question.toString())
  );

  // Step 3: Annotate questions
    let annotatedQuestions = questions.map((q) => {
      const isSolved = solvedSet.has(q._id.toString());
      return {
        ...q.toObject(),
        solved: isSolved
      };
    });


  // Step 4: Apply status filter
  if (status === "solved") {
    annotatedQuestions = annotatedQuestions.filter((q) =>
      solvedSet.has(q._id.toString())
    );
  } else if (status === "unsolved") {
    annotatedQuestions = annotatedQuestions.filter(
      (q) => !solvedSet.has(q._id.toString())
    );
  }

  // Step 5: Count solved questions
  const solvedCount = annotatedQuestions.reduce(
    (count, q) => count + (q.solved !== false ? 1 : 0),
    0
  );

  return res.status(200).json(
    new ApiResponse(200, "Questions fetched successfully", {
      total: annotatedQuestions.length,
      solvedCount,
      questions: annotatedQuestions
    })
  );
});

export {giveTopics,giveCompany};