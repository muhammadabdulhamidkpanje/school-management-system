const mongoose = require("mongoose")

const admissionSchema = new mongoose.Schema({
  personalInfo: {
    firstName: String,
    lastName: String,
    middleName: String,
    email: { type: String, unique: true },
    phone: String,
    address: String,
  },
//   results: {
//     regNumber: String,
//     english: String,
//     math: String,
//     extraCourses: [
//       {
//         course: String,
//         grade: String,
//       },
//     ],
//     program: String,
//     course: String,
//   },
//   documents: {
//     passport: String,
//     birthCert: String,
//     schoolResult: String,
//     medicalReport: String,
//     indigeneCert: String,
//     transferCert: String,
//   },
//   status: {
//     type: String,
//     enum: ["pending", "accepted", "rejected"],
//     default: "pending",
//   },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
});


const Admission = mongoose.model("Admission", admissionSchema);
module.exports = Admission;
