import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import axios from "axios";
import { Question } from "../models/question.models.js";
import { StudyPlan } from "../models/studyplan.models.js";

const postStudyPlan = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { topics } = req.body;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (!Array.isArray(topics) || topics.length === 0) {
        throw new ApiError(400, "Topics must be a non-empty array");
    }
    
    const existingPlan = await StudyPlan.findOne({ user: userId });
    if (existingPlan) {
        throw new ApiError(400, "Study plan already exists for this user");
    }

    const studyPlan = {
        user: userId,
        topics: topics.map(topic => ({
            title: topic.title,
            questions: topic.questions || []
        }))
    };

    const newStudyPlan = await StudyPlan.create(studyPlan);
    if (!newStudyPlan) {
        throw new ApiError(500, "Failed to create study plan");
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Study plan created successfully",
            newStudyPlan
        )
    )
});

const getStudyPlan_admin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const studyPlan = await StudyPlan.findOne({ user: userId }).populate('topics.questions');
    if (!studyPlan) {
        throw new ApiError(404, "Study plan not found for this user");
    }
    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Study plan retrieved successfully",
            studyPlan
        )
    );
});

const getStudyPlan_public = asyncHandler(async (req, res) => {
    const userId  = req.user._id;
    console.log(`Fetching study plan for user: ${userId}`);
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const studyPlan = await StudyPlan.findOne({ user: userId }).populate('topics.questions');
    if (!studyPlan) {
        throw new ApiError(404, "Study plan not found for this user");
    }
    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Study plan retrieved successfully",
            studyPlan
        )
    );
});

const patchStudyPlan_admin = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { action, topics } = req.body;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  if (!action || !["add", "remove", "replace", "rename","delete"].includes(action)) {
    throw new ApiError(400, "Invalid or missing action");
  }
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new ApiError(400, "Topics must be a non-empty array");
  }

  const studyPlan = await StudyPlan.findOne({ user:  userId }).populate("topics.questions");

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found for this user");
  }

  for (const incomingTopic of topics) {
    const existingTopic = studyPlan.topics.find(t => t.title === incomingTopic.title);

    if (action === "add") {
      if (existingTopic) {
        const currentSet = new Set(existingTopic.questions.map(q => q.toString()));
        for (const qid of incomingTopic.questions) {
          currentSet.add(qid);
        }
        existingTopic.questions = Array.from(currentSet);
      } else {
        studyPlan.topics.push({
          title: incomingTopic.title,
          questions: incomingTopic.questions
        });
      }
    }

    if (action === "remove") {
      if (existingTopic) {
        existingTopic.questions = existingTopic.questions.filter(
          qid => !incomingTopic.questions.includes(qid.toString())
        );
      }
    }

    if (action === "replace") {
      if (existingTopic) {
        existingTopic.questions = incomingTopic.questions;
      } 
    }

    if (action === "rename") {
      const { newName } = incomingTopic;
      if (existingTopic && newName) {
        existingTopic.title = newName;
      }
    }

    if (action === "delete") {
        studyPlan.topics = studyPlan.topics.filter(
            t => t.title !== incomingTopic.title
        );
    }
  }

  await studyPlan.save();

  return res.status(200).json(
    new ApiResponse(200, "Study plan updated successfully", { updatedPlan: studyPlan })
  );
});

const deleteStudyPlan_admin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const studyPlan = await StudyPlan.findOneAndDelete({ user: userId });
    if (!studyPlan) {
        throw new ApiError(404, "Study plan not found for this user");
    }
    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Study plan deleted successfully",
            null
        )
    );
});

export { postStudyPlan ,getStudyPlan_admin,getStudyPlan_public,patchStudyPlan_admin,deleteStudyPlan_admin };