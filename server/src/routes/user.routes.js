import { Router } from "express";
import {Signup,Login,Logout,getCurrentUser,getStats,syncSolvedProblems, syncDaily,cronSyncAllUsers} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(Signup)
router.route("/login").post(Login)
router.route("/cron_sync").post(cronSyncAllUsers);


//Secured Routes
router.route("/logout").post(verifyJWT,  Logout)
router.route("/me").get(verifyJWT,getCurrentUser)
router.route("/sync_cookie").post(verifyJWT,syncSolvedProblems);
router.route("/sync_daily").post(verifyJWT,syncDaily);
router.route("/stats").get(verifyJWT,getStats); 






export default router;