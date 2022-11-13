import { Schema } from 'mongoose'

const challengeGame = new Schema({
  id: String,
  principalChat: String,
  challenges: [{ payload: String, isActive: Boolean }],
  penances: [{ payload: String, isActive: Boolean }],
  participants: [{ name: String, number: String }],
  toPrincipal: Boolean
})
