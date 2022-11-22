import { ChallengeGame, defaultsSessions } from '../datasources/challengePenance/challengePenance'
import { correlationFunction, getWordAfter } from './utils'

import mongoose from 'mongoose'

export const messageHandler = async (
  messageRaw: string,
  connection: typeof mongoose,
  principalChat: string
) => {
  const message = messageRaw.toLowerCase()
  if (correlationFunction(message, ['soy', 'hola', 'juego'])) {
    const participant = getWordAfter(message, 'soy')
    const id = message.split(' ').pop()

    if (!id) {
      return 'Debes poner algo en el nombre de la session'
    }

    console.log({ participant, id })
    const challenge = new ChallengeGame(connection)
    const result = await challenge.addParticipant({ id, participant, chatId: principalChat })
    if (!result) return 'algo salio mal, revisa el nombre de la sesion'
    return `${participant} listo ya te agrege, mucha suerte `
  }

  if (message == 'inicia reto') {
    console.log('Fue trigger de crear el reto ')
    try {
      const challenge = new ChallengeGame(connection)
      const result = await challenge.createSession({
        ...defaultsSessions,
        principalChat: principalChat
      })
      return [`Listo cree una sesión llamada 😜`, result]
    } catch (error) {
      console.log('Hubo un error creando', error)
    }
  }

  return 'Aun no entiendo mucho, pronto tendré muchas funciones '
}
