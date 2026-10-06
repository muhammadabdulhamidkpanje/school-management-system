import mongoose, { Schema, Document } from 'mongoose';

interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  position?: string;
  salary?: number;
  dateOfJoining: Date;
}

const staffSchema = new Schema<IStaff>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: false,
    trim: true,
  },
  salary: {
    type: Number,
    required: false,
  },
  dateOfJoining: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default mongoose.model<IStaff>('Staff', staffSchema);
