import { ChallengeGame, defaultsSessions } from '../datasources/challengePenance/challengePenance'
import mongoose from 'mongoose'

export const messageHandler = async (
  message: string,
  connection: typeof mongoose,
  principalChat: string
) => {
  if (message == 'Inicia reto') {
    console.log('Fue trigger de crear el reto ')
    try {
      const challenge = new ChallengeGame(connection)
      const result = await challenge.createSession({
        ...defaultsSessions,
        principalChat: principalChat
      })
      return `Listo cree una sesión llamada ${result} 😜`
    } catch (error) {
      console.log('Hubo un error creando', error)
    }
  }

  return 'creo que es otro mensaje'
}
