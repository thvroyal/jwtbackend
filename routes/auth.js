const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");
const verifyToken = require("./verifyToken");

router.post("/register", async (req, res) => {
  //validate the data before save
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Checking if the user is already in the db
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.send({ code: 0, msg: "Email already exists" });

  //Hash the passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  //Create a new user
  const user = new User({
    first_name: req.body["first_name"],
    last_name: req.body["last_name"],
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    return res.send({ code: 1, user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Checking if the email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send({ code: 0, msg: "Email is not found" });
  //Password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.send({ code: 0, msg: "Invalid password" });

  //Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send({ code: 1, access_token: token });

  // res.send("Logged in!");
});

//Get info user
router.get("/", verifyToken, async (req, res) => {
  decoded = jwt.decode(req.header("auth-token"));
  const user = await User.findOne({ _id: decoded._id });
  if (!user) return res.status(400).send("Invalid user");
  return res.json({
    code: 1,
    infoUser: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      date: user.date,
    },
  });
});
module.exports = router;
