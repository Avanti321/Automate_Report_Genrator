const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {

  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashed,
    role: req.body.role
  });

  await user.save();

  res.json({ message: "User registered successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return res.status(400).send("User not found");

  const valid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!valid)
    return res.status(400).send("Invalid password");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ token, user });
});

module.exports = router;