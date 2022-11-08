import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import qrcode from 'qrcode-terminal'
import { Client, LocalAuth } from 'whatsapp-web.js'

dotenv.config()

const app: Express = express()
let client: Client
const port = process.env.PORT
const MULTI_DEVICE = process.env.MULTI_DEVICE || 'true'
const parentNumber = process.env.PARENTNUMBER

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

client = new Client({
  authStrategy: new LocalAuth(),
  //puppeteer: { headless: true }
  puppeteer: {
    args: ['--no-sandbox']
  }
})
if (!parentNumber) throw new Error('You must provide a parent number')

console.log('Lets start!')

client.on('qr', (qr) => {
  console.log('entering in QR')
  qrcode.generate(qr, { small: true })
  console.log(`Ver QR http://localhost:${port}/qr`)
})

client.on('ready', () => {
  console.log('The client is ready')
  listenMessage()
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
