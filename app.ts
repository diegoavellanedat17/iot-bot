import { Client } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import * as fs from 'fs'
import * as path from 'path'

const SESSION_FILE_PATH = './session.json'
let client: Client
let sessionData
//const client = new Client({})

const withSession = () => {
  console.log('Is executing the already saved session')
}

const withOutSession = () => {
  console.log('Not session saved ')
  client = new Client({})
  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr)
    qrcode.generate(qr, { small: true })
  })

  client.on('authenticated', (session) => {
    // Save the session to use later
    sessionData = session
    // fs.writeFile(SESSION_FILE_PATH, 'JSON.stringify(session)', (err) => {
    //   if (err) {
    //     console.log('Error saving session in file', err)
    //   }
    // })
    console.log('Client is ready!')
  })

  client.on('message', (message) => {
    if (message.body === '!ping') {
      client.sendMessage(message.from, 'pong')
    }
  })

  client.initialize()
}

console.log('Running code', fs.existsSync(SESSION_FILE_PATH))
fs.existsSync(SESSION_FILE_PATH) ? withSession() : withOutSession()
