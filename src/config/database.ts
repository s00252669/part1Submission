import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(env.mongoURI, { dbName: env.dbName });
  console.log(`Connected to MongoDB: ${env.dbName}`);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};