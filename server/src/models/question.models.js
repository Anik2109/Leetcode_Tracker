import mongppse,{ Schema } from 'mongoose';

const QuestionSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true
        },
        topics: {
            type: [String],
            default: []
        },
        companyTags: {
            type: [String],
            default: []
        }

    },
    {
        timestamps: true,
    }
)

export const Question = mongoose.model('Question', QuestionSchema);