import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "secret2";

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not defined");
}

const authController = {
  register: async (req: any, res: any) => {
    const { username, password } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, password: hashedPassword },
      });

      const token = jwt.sign({ username: user.username }, SECRET_KEY, {
        expiresIn: "1h",
      });

      res.status(201).json({
        message: "User registered successfully",
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  login: async (req: any, res: any) => {
    const { username, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ username: user.username }, SECRET_KEY, {
        expiresIn: "1h",
      });

      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getDashboard: async (req: Request, res: Response) => {
    const user = req.user;
    console.log(user);
    res.status(200).json({
      message: `Welcome, ${(req.user as { username: string }).username}`,
    });
  },
  logout: async (req: Request, res: Response) => {
    res.clearCookie("token");
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  },
};

export default authController;
