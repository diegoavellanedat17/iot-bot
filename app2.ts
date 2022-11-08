import WAWebJS, { Client, LegacySessionAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
const client = new Client({
  authStrategy: new LegacySessionAuth({
    session: {} as WAWebJS.ClientSession
  })
})

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr)
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  console.log('Client is ready!')
})

client.initialize()
