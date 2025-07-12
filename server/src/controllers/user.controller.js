import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose, { isValidObjectId } from "mongoose";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
dayjs.extend(isSameOrAfter);
import axios from "axios";
import { Question } from "../models/question.models.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken}
    } catch (error) {
        console.error("Error during token generation:", error);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const Signup = asyncHandler(async (req, res) => {
    const { username, fullName, password } = req.body;

    if (!username || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
        throw new ApiError(400, "Username already exists");
    }

    

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        password,
    });


    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }


    return res.status(201).json(
        new ApiResponse(201, "User created successfully", { createdUser })
    );
});

const Login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;


    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }    

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid username");
    }

    

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
    console.error("Invalid password for user:", user.username);
    throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);    
    
    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");
    if (!LoggedInUser) {
        console.error("Failed to fetch logged-in user:", user._id);
        throw new ApiError(500, "Failed to fetch logged-in user");
    }
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "Login successful",
            {
                user: LoggedInUser,refreshToken,accessToken
            },
        )
    );
});

const Logout = asyncHandler(async (req, res) => {
    //Step1: Delete refresh token from user
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    //Step2: Clear cookies and send response
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.
    status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "Current user fetched successfully", 
            { user: req.user }
        )
    );
});

const syncSolvedProblems = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "User ID is not valid");
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const csrfToken = req.headers['x-csrftoken'];
    const cookie = req.headers['cookie'];
    if (!csrfToken || !cookie) {
        throw new ApiError(400, "CSRF token and cookie are required");
    }
    const limit = 50;
  let skip = 0;
  let total = Infinity;
  const solvedIds = new Set(user.solvedProblems.map(id => id.toString()));
  const seenQuestions = new Set();

  while (skip < total) {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `query getSolved($filters: QuestionListFilterInput, $limit: Int, $skip: Int) {
          questionList(categorySlug: "", filters: $filters, limit: $limit, skip: $skip) {
            total: totalNum
            questions: data {
              questionFrontendId
              title
              titleSlug
              difficulty
            }
          }
        }`,
        variables: {
          filters: { status: "AC" },
          limit,
          skip
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": csrfToken,
          "Cookie": cookie,
          "Referer": "https://leetcode.com",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const data = response.data.data.questionList;
    total = data.total;

    for (const q of data.questions) {
        if (seenQuestions.has(q.questionFrontendId)) continue; 
        seenQuestions.add(q.questionFrontendId);

        const dbQuestion = await Question.findOne({ Qid: q.questionFrontendId });
        if (dbQuestion) {
            solvedIds.add(dbQuestion._id.toString());
        }
    }


    skip += limit;
  }

  user.solvedProblems = [...solvedIds]; 
  user.lastSynced = new Date();
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, 
        "User's solved problems synced", 
        {
        count: user.solvedProblems.length,
        }
    )
)
});

const getStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "User ID is not valid");
    }
    const user = await User.findById(userId).populate("solvedProblems");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let today = dayjs().startOf("day");
    let weekStart = today.subtract(6, "day"); 
    let easy=0;
    let medium=0;
    let hard=0;
    let solvedThisWeek=0;
    let perDay={};

    

    for (let i = 0; i < 7; i++) {
        let d = weekStart.add(i, "day").format("YYYY-MM-DD");
        perDay[d] = 0;
    }


    for (const q of user.solvedProblems) {
        const diff = q.difficulty?.toLowerCase();
        if (diff === "easy") easy++;
        else if (diff === "medium") medium++;
        else if (diff === "hard") hard++;

        const created = dayjs(q.createdAt);
        const dateStr = created.format("YYYY-MM-DD");

        if (created.isSameOrAfter(weekStart)) {
            solvedThisWeek++;
            if (perDay[dateStr] !== undefined) {
                perDay[dateStr]++;
            }
        }
    }


    const tod = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    const todaySolved = perDay[tod] || 0;
    const yesterdaySolved = perDay[yesterday] || 0;
    const now = dayjs();

    if (todaySolved > 0) {
      user.streak += 1;
    } else if (yesterdaySolved > 0 && now.hour() < 23 && now.minute() < 59) {
    } else {
      user.streak = 0;
}
    await user.save({ validateBeforeSave: false });



    const stats = {
        totalSolved: user.solvedProblems.length,
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
        streak: user.streak,
        weekSolved: solvedThisWeek,
        dailySolved: perDay,
        lastSynced: user.lastSynced ? dayjs(user.lastSynced).format("YYYY-MM-DD HH:mm:ss") : null,
    };


    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            "User stats fetched successfully", 
            {stats}
        )
    );
});

const syncDaily = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User ID is not valid");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const username = user.username;
  if (!username) {
    throw new ApiError(400, "Username is required for syncing daily problems");
  }

  const limit = 20;
  const solvedIds = new Set(user.solvedProblems.map(id => id.toString()));
  const seenSlugs = new Set(); // since recentAcSubmissionList uses slugs

  const response = await axios.post(
    "https://leetcode.com/graphql",
    {
      query: `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `,
      variables: {
        username,
        limit,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Referer": `https://leetcode.com/${username}/`,
        "User-Agent": "Mozilla/5.0",
      },
    }
  );

  const submissions = response.data.data.recentAcSubmissionList;
  let newSolvedCount = 0;

  for (const sub of submissions) {
    if (seenSlugs.has(sub.titleSlug)) continue;
    seenSlugs.add(sub.titleSlug);

    const dbQuestion = await Question.findOne({ slug: sub.titleSlug });
    if (dbQuestion) {
      const idStr = dbQuestion._id.toString();
      if (!solvedIds.has(idStr)) {
        solvedIds.add(idStr);
        newSolvedCount++;
      }
    }
  }

  user.solvedProblems = [...solvedIds];
  user.lastSynced = new Date();
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "Daily solved problems synced", {
      newlyAdded: newSolvedCount,
      totalSolved: user.solvedProblems.length,
      lastSynced: user.lastSynced,
    })
  );
});

export{Signup, Login, Logout, getCurrentUser, generateAccessAndRefreshTokens,getStats,syncSolvedProblems,syncDaily};

