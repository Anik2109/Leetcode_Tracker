import XLSX from "xlsx";
import mongoose from "mongoose";
import { Question } from "./src/models/question.models.js";

// 1️⃣ Config
const MONGO_URI = "mongodb+srv://kausheshanik21:cutie@cluster0.sqkjz9t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const FILE_PATH = "./leetcode_company_tracker.xlsx";

// 2️⃣ Connect to DB
try {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");
} catch (err) {
  console.error("❌ Error connecting to MongoDB:", err.message);
  process.exit(1);
}

// 3️⃣ Read Workbook
const workbook = XLSX.readFile(FILE_PATH);

if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
  console.error("❌ No sheets found in the workbook");
  process.exit(1);
}

console.log("✅ Workbook loaded successfully");

// 4️⃣ Filter Sheets (skip first and last by name)
const sheetsToProcess = workbook.SheetNames.filter(
  (name) => name !== "ID Tracker" && name !== "Track Progress"
);

// 5️⃣ Process Each Sheet
for (let sheetName of sheetsToProcess) {
  const companyName = sheetName.trim();
  const sheet = workbook.Sheets[sheetName];
  let data = XLSX.utils.sheet_to_json(sheet);

  // Remove last row (invalid)
  if (data.length > 1) {
    data = data.slice(0, -1);
  } else if (data.length === 1) {
    console.log(`ℹ️ Only one valid question in "${companyName}" after removing invalid last row.`);
    data = [];
  }

  if (data.length === 0) {
    console.log(`❌ Sheet "${companyName}" has no valid data.`);
    continue;
  }

  const keys = Object.keys(data[0]);
  const keysToKeep = keys.slice(0, -1);

  const cleanedData = data.map((row) => {
    const newRow = {};
    for (let key of keysToKeep) {
      newRow[key] = row[key];
    }
    return newRow;
  });

  console.log(`\n📄 Company: ${companyName}`);
  console.log(`✅ Columns after cleaning:`, keysToKeep);
  // console.log(`✅ First Sample:`, cleanedData[0]);
  // if (cleanedData.length > 1) {
  //   console.log(`✅ Last Sample:`, cleanedData[cleanedData.length - 1]);
  // } else {
  //   console.log(`ℹ️ Only one valid question in this sheet.`);
  // }

  // 6️⃣ Insert or Update Each Question
  for (let item of cleanedData) {
    if (!item.Title) {
      console.log(`⚠️ Skipping question with missing title in "${companyName}":`, item);
      continue;
    }

    try {
      const existing = await Question.findOne({ Qid: item.ID });

      if (existing) {
        // If companyTag already exists, skip updating
        if (!existing.companyTags.includes(companyName)) {
          await Question.updateOne(
            { Qid: item.ID },
            { $addToSet: { companyTags: companyName } }
          );
          console.log(`✅ Added new company tag to existing question: ${item.ID}`);
        } else {
          console.log(`ℹ️ Company tag already exists for question: ${item.ID}`);
        }
      } else {
        await Question.create({
          Qid: item.ID,
          title: item.Title,
          slug: item.Slug,
          difficulty: item.Difficulty,
          topics: item.Topics ? item.Topics.split(",").map((s) => s.trim()) : [],
          companyTags: [companyName],
        });
        console.log(`✅ Inserted new question: ${item.ID}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${item.ID} for ${companyName}:`, err.message);
    }
  }

  console.log(`✅ Finished processing "${companyName}"`);
}

// 7️⃣ Disconnect
await mongoose.disconnect();
console.log("🎯 All Sheets Processed & Database Updated Successfully!");