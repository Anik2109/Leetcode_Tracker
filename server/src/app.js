import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();




app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/api/ping", (req, res) => {
  console.log("✅ /ping route hit");
  res.send("pong");
});

//routes import
import userRouter from "./routes/user.routes.js"
import questionRouter from "./routes/question.routes.js";
import studyPlanRouter from "./routes/studyplan.routes.js";

//routes decalaration
app.use("/api/users", userRouter)
app.use("/api/ques", questionRouter)
app.use("/api/studyplan", studyPlanRouter)


export { app }