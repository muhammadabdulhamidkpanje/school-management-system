const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Token generator
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email }); 
    if (userExists) {
      return res
        .status(400)
        .json({ status: "fail", message: "User already exists" });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const token = generateToken(user);
    return res.status(201).json({ status: "success", data: { user, token } });
  } catch (error) {
    res
      .status(400)
      .json({
        status: "fail",
        message: "Something went wrong: " + error.message,
      });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json({ status: "fail", message: "Invalid email or password" });
  }
  const token = generateToken(user);
  return res.status(200).json({ status: "success", data: { user, token } });
};

// Get Profile
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json(user);
};
