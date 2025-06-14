import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) =>
  jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const register = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ msg: "User exists" });

    const user = await User.create({ name, email, password, isAdmin });
    res.status(201).json({ token: generateToken(user) });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({ token: generateToken(user) });
    } else {
      res.status(401).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
};
