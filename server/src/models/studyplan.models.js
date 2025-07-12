import mongoose, { Schema } from "mongoose";

const StudyPlanSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // one plan per user
  },
  topics: [
    {
      title: {
        type: String,
        required: true
      },
      questions: [
        {
          type: String,
        }
      ]
    }
  ]
}, {
  timestamps: true
});

export const StudyPlan = mongoose.model("StudyPlan", StudyPlanSchema);