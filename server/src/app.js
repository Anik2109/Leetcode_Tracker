import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.get("/ping", (req, res) => {
  console.log("✅ /ping route hit");
  res.send("pong");
});


app.use(cors({
    origin: "*",
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"


//routes decalaration
app.use("/api/users", userRouter)




export { app }