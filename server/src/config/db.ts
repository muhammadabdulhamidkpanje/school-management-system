import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('DB connected');
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
