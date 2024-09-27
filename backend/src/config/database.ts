import { Logger } from '@/utils/logger';
import 'dotenv/config'
import mongoose from 'mongoose';

const logger: Logger = new Logger(`Database`)

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.log('MongoDB connected successfully');
  } catch (error) {
    logger.error(`MongoDB connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;