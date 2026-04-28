import mongoose from 'mongoose';

export default async function connectMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/knowme';

  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Error MongoDB:', err.message);
    process.exit(1);
  }
}