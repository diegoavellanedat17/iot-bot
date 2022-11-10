import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import qrcode from 'qrcode-terminal'
import { Client, LocalAuth, RemoteAuth } from 'whatsapp-web.js'
import { MongoStore } from 'wwebjs-mongo'
import mongoose from 'mongoose'

dotenv.config()

const app: Express = express()
let client: Client
const port = process.env.PORT
const MULTI_DEVICE = process.env.MULTI_DEVICE || 'true'
const parentNumber = process.env.PARENTNUMBER
const databaseURL = process.env.MONGO_DB || 'unknowdn'

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
    if (parentNumber) client.sendMessage(parentNumber, `Message from ${from}: ${body}`)
    return
  })
}
const dataBaseConnection = async () => {
  const UserSchema = new mongoose.Schema({ name: { type: String } })
  await mongoose.connect(databaseURL)
  const store = new MongoStore({ mongoose: mongoose })

  client = new Client({
    // authStrategy: new LocalAuth(),
    // //puppeteer: { headless: true }
    // puppeteer: {
    //   args: ['--no-sandbox']
    // }
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
dataBaseConnection()
