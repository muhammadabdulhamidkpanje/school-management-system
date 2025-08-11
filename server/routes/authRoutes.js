const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getUserProfile,
} = require("../controllers/authcontroller");

const { protect } = require('../middlewares/authMiddleware');


router.post('/register', register);
router.post('/login', login);
router.get('/getUserProfile', protect, getUserProfile);



module.exports = router;