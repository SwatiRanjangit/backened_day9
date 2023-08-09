const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  validateName,
  validateEmail,
  validatePassword,
} = require("../utils/validators");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, isSeller } = req.body;

    // Use findOne method on User model instead of undefined 'user' variable
    const existingUser = await User.findOne({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res.status(403).json({ err: "User already exists" }); // Changed "exist" to "exists"
    }

    if (!validateName(name)) {
      return res.status(400).json({ err: "Name validation failed" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ err: "Email validation failed" }); // Changed "email" to "Email"
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ err: "Password validation failed" }); // Changed "password" to "Password"
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Added salt rounds (e.g., 10)
    const user = {
      email,
      name,
      isSeller,
      password: hashedPassword,
    };

    const createdUser = await User.create(user);

    return res.status(201).json({
      message: `Welcome ${createdUser.name}`,
    });
  } catch (e) {
    console.error(e); // Changed console.log to console.error for better error handling
    return res.status(500).json({ err: "Internal Server Error" }); // Added error response for catch block
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email.length === 0) {
      return res.status(400).json({
        err: "please provide email",
      });
    }
    if (password.length === 0) {
      return res.status(400).json({
        err: "please provide right password",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      res.status(400).json({
        err: "User not found",
      });
    }

    const passwordMatched = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordMatched) {
      return res.status(400).json({
        err: "email or password mismatched",
      });
    }

    const payload = { user: { id: existingUser.id } };
    const bearerToken = await jwt.sign(payload, "SECERET MESSAGE", {
      expiresIn: 36000,
    });

    res.cookie("t", bearerToken, { expire: new Date() + 9999 });

    return res.status(200).json({
      bearerToken,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.get("/signout", (req, res) => {
  try {
    res.clearCookie("t");
    return res.status(200).json({ message: "cookie deleted" });
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
