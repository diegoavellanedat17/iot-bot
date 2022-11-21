import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()
const databaseURL = process.env.MONGODB_URI || 'UNKNOWN'

let _db

export async function initDb() {
  _db = await mongoose.connect(databaseURL)
  const state = await mongoose.connection.readyState
  console.log('el estado de la base de datos es ', state)
  return _db
}
