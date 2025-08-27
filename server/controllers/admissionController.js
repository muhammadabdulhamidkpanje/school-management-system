const Admission = require('../models/admission'); 

exports.SubmitAdmission = async (req, res) => {

    try {
        const admissionData = req.body;
        const newAdmission = await Admission.create(admissionData);
        res.status(201).json({
            status: "success",
            data: {
                admission: newAdmission
            }
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message 
        });
    }
};
exports.GetAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find();
        res.status(200).json({
            status: "success",
            data: {
                admissions
            }
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
};
