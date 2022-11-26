import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import qrcode from 'qrcode-terminal'
import { Client, RemoteAuth, Message } from 'whatsapp-web.js'
import { MongoStore } from 'wwebjs-mongo'
import { messageHandler } from './messagesHandlers/messages'
import mongoose from 'mongoose'
import { ChallengeGame, defaultsSessions } from './datasources/challengePenance/challengePenance'
import cron from 'node-cron'
import { initDb } from './db'

dotenv.config()

const app: Express = express()
let client: Client
const port = process.env.PORT
const parentNumber = process.env.PARENTNUMBER
const databaseURL = process.env.MONGODB_URI || 'unknowdn'
const testing = false

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})

const listenMessage = (connection: typeof mongoose) => {
  client.on('message', async (msg) => {
    const { body, id, from, author, to } = msg
    const mentions = await msg.getMentions()
    const { fromMe } = id
    console.log('reciviboooooo', msg)
    if (!fromMe) console.log('Incomming message', body)
    if (parentNumber) {
      client.sendMessage(parentNumber, `Message from ${from}: ${body}`)
      // const translatedMessage = await translateMessage(body)
      // client.sendMessage(parentNumber, translatedMessage!)
      const messageResponse = await messageHandler(body, connection, from, author, mentions, to)
      if (Array.isArray(messageResponse)) {
        messageResponse.map((message) => {
          client.sendMessage(from, message)
        })
        return
      }
      if (typeof messageResponse === 'object' && messageResponse.sendToParticipant) {
        await client.sendMessage(from, messageResponse.text)
        await client.sendMessage(messageResponse.chatId, messageResponse.text)
      }
      if (typeof messageResponse === 'object' && !messageResponse.sendToParticipant) {
        await client.sendMessage(from, messageResponse.text)
      }
      await client.sendMessage(from, messageResponse)
    }

    return
  })
}

const dataBaseConnection = async () => {
  const connection = await initDb()
  // Create an object with all the necessary defaults
  const challenge = new ChallengeGame(connection)
  // await challenge.createSession({
  //   ...defaultsSessions,
  //   principalChat: '1234'
  // })
  //await challenge.getSessionById('session-002')
  // const agregado = await challenge.addParticipant({
  //   id: 'additional-blush-takin',
  //   participant: 'juancho',
  //   chatId: 'mockChatId'
  // })
  // console.log('fue agreagado? ', agregado)
  // await challenge.addChallenges({
  //   chatId: 'mockChatId',
  //   challenges: ['toca', 'mirame', 'levanta', 'besar', 'saltar', 'romper', 'encontrar', 'terminar']
  // })
  // await challenge.updateSessionById('session-002')
  // await challenge.pickChallenges('additional-blush-takin')
  // await challenge.closeGames()
  if (!testing) {
    const UserSchema = new mongoose.Schema({ name: { type: String } })
    const store = new MongoStore({ mongoose: mongoose })
    client = new Client({
      puppeteer: {
        args: ['--no-sandbox']
      },
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000
      })
    })
    if (!parentNumber) throw new Error('You must provide a parent number ok ?')

    client.on('qr', (qr) => {
      console.log('entering in QR')
      qrcode.generate(qr, { small: true })
      console.log(`Ver QR http://localhost:${port}/qr`)
    })

    client.on('ready', () => {
      console.log('The client is ready')
      listenMessage(connection)
      cron.schedule('0 */6 * * *', function () {
        console.log('---------------------')
        console.log('running a ttask cada minuto')
        client.sendMessage(parentNumber, `Is still working`)
      })
    })

    client.on('remote_session_saved', () => {
      console.log('session already saved')
    })

    client.on('authenticated', () => {
      console.log('AUTHENTICATED')
    })

    client.on('message_create', (msg) => {
      const { body, id } = msg
      const { fromMe } = id
      if (fromMe) console.log('Outcomming message ', body)
    })

    client.initialize()
  }
}

console.log('starting code ')

dataBaseConnection()
