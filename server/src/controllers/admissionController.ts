import { Request, Response } from 'express';
import Admission from '../models/admission';

export const SubmitAdmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const admissionData = req.body;
    const newAdmission = await Admission.create(admissionData);
    res.status(201).json({
      status: 'success',
      data: {
        admission: newAdmission,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const GetAdmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const admissions = await Admission.find();
    res.status(200).json({
      status: 'success',
      data: {
        admissions,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
