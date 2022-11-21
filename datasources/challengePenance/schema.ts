import { Schema } from 'mongoose'

export const challengeGame = new Schema({
  id: String,
  isActive: Boolean,
  toPrincipal: Boolean,
  principalChat: String,
  challenges: [{ payload: String, isActive: Boolean }],
  penances: [{ payload: String, isActive: Boolean }],
  participants: [{ name: String, chatId: String, isActive: Boolean }]
})
