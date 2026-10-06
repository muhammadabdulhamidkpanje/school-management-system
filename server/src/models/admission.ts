import mongoose, { Schema, Document } from 'mongoose';

interface IAdmission extends Document {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone: string;
    address: string;
  };
  admissionDate: Date;
}

const admissionSchema = new Schema<IAdmission>({
  personalInfo: {
    firstName: String,
    lastName: String,
    middleName: String,
    email: { type: String, unique: true },
    phone: String,
    address: String,
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
});

const Admission = mongoose.model<IAdmission>('Admission', admissionSchema);
export default Admission;
