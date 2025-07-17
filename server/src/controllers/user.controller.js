import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import {Contest} from "../models/contest.models.js";
import { Question } from "../models/question.models.js";
import { isValidObjectId } from "mongoose";
import {scrapeAllContests} from "./contest.controller.js";
import axios from "axios";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);

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
    // console.error("Invalid password for user:", user.username);
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

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const csrfToken = req.headers["x-csrftoken"];
  const cookie = req.headers["cookie"];
  if (!csrfToken || !cookie) {
    throw new ApiError(400, "CSRF token and cookie are required");
  }

  const limit = 50;
  let skip = 0;
  let total = Infinity;

  const solvedIds = new Set(user.solvedProblems.map(item => item.question.toString()));
  const seenQuestions = new Set();
  let newSolvedCount = 0;

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
          skip,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": csrfToken,
          Cookie: cookie,
          Referer: "https://leetcode.com",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    const data = response.data.data.questionList;
    total = data.total;

    for (const q of data.questions) {
      if (seenQuestions.has(q.questionFrontendId)) continue;
      seenQuestions.add(q.questionFrontendId);

      const dbQuestion = await Question.findOne({ Qid: q.questionFrontendId });
      if (dbQuestion) {
        const questionId = dbQuestion._id.toString();
        if (!solvedIds.has(questionId)) {
          user.solvedProblems.push({
            question: dbQuestion._id,
            solvedOn: new Date(), // or use actual timestamp if you have it
          });
          solvedIds.add(questionId);
          newSolvedCount++;
        }
      }
    }

    skip += limit;
  }

  user.lastSynced = new Date();
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "User's solved problems synced", {
      count: user.solvedProblems.length,
      newlyAdded: newSolvedCount,
      lastSynced: user.lastSynced,
    })
  );
});

const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User ID is not valid");
  }

  const user = await User.findById(userId).populate("solvedProblems.question");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let today = dayjs().utc().startOf("day");
  let weekStart = today.subtract(6, "day");
  let weekCount=0;
  let easy = 0;
  let medium = 0;
  let hard = 0;
  let perDay = {};

  // Initialize perDay with all 7 days
  for (let i = 0; i < 7; i++) {
    const d = weekStart.add(i, "day").format("YYYY-MM-DD");
    perDay[d] = 0;
  }

  for (const entry of user.solvedProblems) {
    const q = entry.question;
    const solvedDate = dayjs.utc(entry.solvedOn);
    const dateStr = solvedDate.format("YYYY-MM-DD");

    if (q?.difficulty) {
      const diff = q.difficulty.toLowerCase();
      if (diff === "easy") easy++;
      else if (diff === "medium") medium++;
      else if (diff === "hard") hard++;
    }

    if (solvedDate.isSameOrAfter(weekStart)) {
      weekCount++;
      if (perDay[dateStr] !== undefined) {
        perDay[dateStr]++;
      }
    }
  }


// const today = dayjs().utc().startOf("day");
const todayStr = dayjs.utc().format("YYYY-MM-DD");
const yesterdayStr = dayjs.utc().subtract(1, "day").format("YYYY-MM-DD");



const didSolveYesterday = (perDay[yesterdayStr] || 0) > 0;
const didSolveToday = (perDay[todayStr] || 0) > 0;


if (!didSolveYesterday && !didSolveToday) {
  user.lastMissedDate = dayjs.utc(yesterdayStr).toDate();
  await user.save();
  // console.warn("🔴 Updated lastMissedDate to", yesterdayStr);
} else {
  // console.log("🟢 No update to lastMissedDate"); 
}

// === STREAK CALCULATION ===
let streak = 0;
let current = dayjs.utc().subtract(1, "day"); // Only count *complete* days

while (true) {
  const dateStr = current.format("YYYY-MM-DD");

  if ((perDay[dateStr] || 0) > 0) {
    streak++;
    current = current.subtract(1, "day");
  } else {
    break;
  }
}

streak = Math.max(streak, 0); // Ensure streak is not negative
streak = streak + (didSolveToday ? 1 : 0); // Add today if solved
// console.log(`📈 Calculated streak: ${streak} days (as of ${current.add(1, "day").format("YYYY-MM-DD")})`);
  

  await user.save({ validateBeforeSave: false });

  const nextContest = await Contest.findOne({
  endTime: { $gt: new Date() },  
  active: true                   
}).sort({ startTime: 1 });    



  const stats = {
    totalSolved: user.solvedProblems.length,
    easySolved: easy,
    mediumSolved: medium,
    hardSolved: hard,
    streak,
    dailySolved: perDay,
    lastSynced: user.lastSynced ? user.lastSynced.toISOString() : null,
    nextContest: nextContest,
    weekCount: weekCount,
  };

  return res.status(200).json(
    new ApiResponse(200, "User stats fetched successfully", { stats })
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

  // Convert existing to Set of question ID strings for quick lookup
  const solvedMap = new Map(); // Map<questionId, Date>
  for (const entry of user.solvedProblems) {
    solvedMap.set(entry.question.toString(), entry.solvedOn);
  }

  const seenSlugs = new Set(); // to avoid duplicate slugs in this batch

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
    if (!dbQuestion) continue;

    const qIdStr = dbQuestion._id.toString();
    const solvedDate = new Date(sub.timestamp * 1000); // Convert UNIX to JS Date

    if (!solvedMap.has(qIdStr)) {
      // new entry
      solvedMap.set(qIdStr, solvedDate);
      newSolvedCount++;
    }
  }

  // Rebuild solvedProblems array
  if (newSolvedCount > 0) {
    user.solvedProblems = Array.from(solvedMap.entries()).map(([questionId, solvedOn]) => ({
      question: questionId,
      solvedOn
    }));
  }

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

const AddContestPref = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User ID is not valid");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const{pref} = req.body;
  if (!pref || !Array.isArray(pref)) {
    throw new ApiError(400, "Preferences must be an array");
  }

  user.contestPrefrences = pref;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(
    new ApiResponse(200, "Contest preferences updated successfully", {
      contestPreferences: user.contestPrefrences
    })
  );
});


const cronSyncAllUsers = asyncHandler(async (req, res) => {
  const secret = req.headers["x-cron-secret"];
  if (!secret || secret !== process.env.CRON_SECRET) {
    throw new ApiError(401, "Unauthorized CRON access");
  }

  const users = await User.find({}, "_id username solvedProblems");
  let successCount = 0;
  const failed = [];

  for (const user of users) {
    const username = user.username;
    if (!username) continue;

    const limit = 20;
    const solvedMap = new Map(user.solvedProblems.map(entry => [entry.question.toString(), entry.solvedOn]));
    const seenSlugs = new Set();

    try {
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
          variables: { username, limit },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Referer": `https://leetcode.com/${username}/`,
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      const submissions = response.data.data.recentAcSubmissionList || [];
      let newSolvedCount = 0;

      for (const sub of submissions) {
        if (seenSlugs.has(sub.titleSlug)) continue;
        seenSlugs.add(sub.titleSlug);

        const dbQuestion = await Question.findOne({ slug: sub.titleSlug });
        if (!dbQuestion) continue;

        const qIdStr = dbQuestion._id.toString();
        const solvedDate = new Date(sub.timestamp * 1000);

        if (!solvedMap.has(qIdStr)) {
          solvedMap.set(qIdStr, solvedDate);
          newSolvedCount++;
        }
      }

      if (newSolvedCount > 0) {
        user.solvedProblems = Array.from(solvedMap.entries()).map(([questionId, solvedOn]) => ({
          question: questionId,
          solvedOn
        }));
        successCount++;
      }

      user.lastSynced = new Date();
      await user.save();

    } catch (err) {
      failed.push(username);
      console.error(`❌ Sync failed for ${username}: ${err.message}`);
    }
  }

  console.log(`✅ User Sync finished: ${successCount}/${users.length} users synced.`);

  // ----- Sync Contests -----
  try {
    const contests = await scrapeAllContests(); // Should return unified contests array

    if (!Array.isArray(contests)) {
      throw new ApiError("scrapeAllContests did not return an array");
    }

    const inserted = [];
    const skipped = [];

    for (const contest of contests) {
      const alreadyExists = await Contest.findOne({
        name: contest.name,
        platform: contest.platform,
        startTime: contest.startTime,
      });

      if (alreadyExists) {
        skipped.push(contest);
      } else {
        const created = await Contest.create(contest);
        inserted.push(created);
      }
    }

    console.log(`✅ Contests Sync: ${inserted.length} inserted, ${skipped.length} skipped.`);

  } catch (err) {
    console.error(`❌ Contest Sync Failed: ${err.message}`);
  }

  return res.status(200).json(
    new ApiResponse(200, "CRON Sync Completed", {
      users: {
        total: users.length,
        synced: successCount,
        failed: failed.length,
        failedUsers: failed,
      },
      contests: {
        inserted: inserted.length,
        skipped: skipped.length,
      }
    })
  );
});

export{Signup, Login, Logout, getCurrentUser, generateAccessAndRefreshTokens,getStats,syncSolvedProblems,syncDaily,cronSyncAllUsers,AddContestPref};

