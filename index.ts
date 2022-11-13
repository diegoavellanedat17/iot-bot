import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import qrcode from 'qrcode-terminal'
import { Client, LocalAuth, RemoteAuth } from 'whatsapp-web.js'
import { MongoStore } from 'wwebjs-mongo'
import { messageHandler } from './messagesHandlers/messages'
import mongoose from 'mongoose'
import { translateMessage } from './datasources/translator/translator'
import cron from 'node-cron'
import { connectDatabase } from './db'

dotenv.config()

const db = connectDatabase()
const app: Express = express()
let client: Client
const port = process.env.PORT
const parentNumber = process.env.PARENTNUMBER
const databaseURL = process.env.MONGODB_URI || 'unknowdn'

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})

const listenMessage = () => {
  client.on('message', async (msg) => {
    const { body, id, from } = msg
    const { fromMe } = id
    if (!fromMe) console.log('Incomming message', body)
    if (parentNumber) {
      client.sendMessage(parentNumber, `Message from ${from}: ${body}`)
      // const translatedMessage = await translateMessage(body)
      // client.sendMessage(parentNumber, translatedMessage!)
      // const messageReponse = await messageHandler(body)
      // client.sendMessage(parentNumber, messageReponse)
    }

    return
  })
}
const dataBaseConnection = async () => {
  const UserSchema = new mongoose.Schema({ name: { type: String } })
  const store = new MongoStore({ mongoose: mongoose })

  client = new Client({
    // authStrategy: new LocalAuth(),
    // //puppeteer: { headless: true }
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
    listenMessage()
    cron.schedule('* */6 * * *', function () {
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
console.log('starting code ')

dataBaseConnection()
