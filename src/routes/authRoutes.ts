import express from "express";
import passport from "../middleware/passport";
import authController from "../controllers/authController";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get(
  "/dashboard",
  passport.authenticate("jwt", { session: false }),
  authController.getDashboard
);
router.post("/logout", authController.logout);

export default router;
