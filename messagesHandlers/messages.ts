import { ChallengeGame, defaultsSessions } from '../datasources/challengePenance/challengePenance'
import { correlationFunction, getWordAfter, isGroup, getNumber } from './utils'

import mongoose from 'mongoose'

export const messageHandler = async (
  messageRaw: string,
  connection: typeof mongoose,
  principalChat: string,
  author?: string,
  mentions?: any,
  to?: string
): Promise<any> => {
  const message = messageRaw.toLowerCase()

  if (isGroup(principalChat)) {
    console.log('las menciones son', mentions)
    console.log('el yo soooy', to)
    if (to && mentions.length) {
      let mentionMe = false
      const toNumber = getNumber(to)
      mentions.map((mention: any) => {
        if (mention.number === toNumber) {
          mentionMe = true
        }
      })
      if (mentionMe) return 'gracias por la mencion'
      return 'estamos en grupo pero no me mencionas'
    }

    return 'si es un grupo'
  }

  if (correlationFunction(message, ['soy', 'hola', 'juego'])) {
    const participant = getWordAfter(message, 'soy')
    const id = message.split(' ').pop()
    if (!id) {
      return 'Debes poner algo en el nombre de la session'
    }

    console.log({ participant, id })
    const challenge = new ChallengeGame(connection)
    const result = await challenge.addParticipant({ participant, chatId: principalChat })
    return result.text
  }

  if (correlationFunction(message, ['mis', 'retos'])) {
    const challengesRaw = message.split(':')[1]
    const challenges = challengesRaw.split(',')
    const challenge = new ChallengeGame(connection)
    const result = await challenge.addChallenges({ chatId: principalChat, challenges })
    return result.text
  }

  if (correlationFunction(message, ['mis', 'penitencias'])) {
    const penancessRaw = message.split(':')[1]
    const penances = penancessRaw.split(',')
    const penance = new ChallengeGame(connection)
    const result = await penance.addPenances({ chatId: principalChat, penances })
    return result.text
  }

  if (correlationFunction(message, ['lanza', 'reto'])) {
    const challenge = new ChallengeGame(connection)
    const id = message.split(' ').pop()
    if (!id) return 'no olvides escribir un juego'
    const result = await challenge.pickChallenges()
    return result
  }

  if (correlationFunction(message, ['lanza', 'penitencia'])) {
    const penance = new ChallengeGame(connection)
    const id = message.split(' ').pop()
    if (!id) return 'no olvides escribir un juego'
    const result = await penance.pickPenances()
    return result.text
  }

  if (message === 'inicia el juego') {
    console.log('Fue trigger de crear el reto ')
    try {
      const challenge = new ChallengeGame(connection)
      const result = await challenge.createSession({
        ...defaultsSessions,
        principalChat: principalChat
      })
      return [`Listo cree una sesi??n llamada ????`, result]
    } catch (error) {
      console.log('Hubo un error creando', error)
    }
  }

  if (message === 'termina el juego') {
    const challenge = new ChallengeGame(connection)
    const result = await challenge.closeGames()
    return result.text
  }

  return 'Aun no entiendo mucho, pronto tendr?? muchas funciones '
}
