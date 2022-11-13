import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()
const databaseURL = process.env.MONGODB_URI || 'UNKNOWN'

export const connectDatabase = async () => {
  const db = await mongoose.connect(databaseURL)
  console.log('The database', db)
  return db
}
