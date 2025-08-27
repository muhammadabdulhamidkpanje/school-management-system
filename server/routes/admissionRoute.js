const express = require("express");
const router = express.Router();
const {
    SubmitAdmission,
    GetAdmissions
} = require("../controllers/admissionController");

router.post("/", SubmitAdmission);
router.get("/", GetAdmissions);

module.exports = router;
