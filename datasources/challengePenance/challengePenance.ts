import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator'
import { challengeGame } from './schema'

const customConfigGenerator: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: '-',
  length: 3
}

interface ChallengePenances {
  payload: string
  isActive: boolean
}

interface Participants {
  name: string
  chatId: string
}

interface AddParticipantParameters {
  participant: string
  chatId: string
}

export type createNewSessionParameters = {
  principalChat: string
  challenges?: ChallengePenances[]
  penances?: ChallengePenances[]
  participants?: Participants[]
  toPrincipal?: Boolean
}

export const defaultsSessions: Partial<createNewSessionParameters> = {
  challenges: [],
  penances: [],
  participants: [],
  toPrincipal: true
}
export class ChallengeGame {
  private dbConnection
  private challengeModel
  constructor(dbConnection: any) {
    this.dbConnection = dbConnection
    this.challengeModel = dbConnection.model('ChallengePenance', challengeGame)
  }

  createSession = async (payload: createNewSessionParameters) => {
    const { principalChat, penances, challenges, toPrincipal, participants } = payload
    const state = await this.dbConnection.connection.readyState
    const sessionName = uniqueNamesGenerator(customConfigGenerator)
    const doc = this.challengeModel({
      id: sessionName,
      isActive: true,
      principalChat,
      penances,
      challenges,
      toPrincipal,
      participants
    })
    await doc.save()
    return sessionName
  }

  getSessionById = async (id: string) => {
    const document = await this.challengeModel.find({ id: id })
    console.log('documents------>>', document)
  }

  updateSessionById = async (id: string) => {
    await this.challengeModel.updateOne({ id }, { isActive: true })
  }

  addParticipant = async ({ participant, chatId }: AddParticipantParameters) => {
    try {
      // TODO verificar si hay alguna session ativa
      const game = await this.challengeModel.findOne({ isActive: true })
      if (!game) {
        return { text: 'Probablemente no hay sesiones abiertas', status: false }
      }
      // const result = await this.challengeModel.findOne({ id })
      const participants = game.participants
      // TODO verificar si el numero ya existe para no tener a nadie repetidoj
      const isParticipant = (element: Participants) => element.chatId === chatId
      if (participants.some(isParticipant)) {
        return { text: 'Este participante ya existe en el juego', status: false }
      }

      participants.push({ name: participant, isActive: true, chatId })
      await this.challengeModel.updateOne(
        {
          id: game.id
        },
        { participants }
      )
      return { text: `${participant} listo ya te agrege, mucha suerte`, status: true }
    } catch (error) {
      console.log('Error', error)
      return { text: 'Revisa que exista la sesion', status: false }
    }
  }

  addChallenges = async ({ chatId, challenges }: { chatId: string; challenges: string[] }) => {
    try {
      const game = await this.challengeModel.findOne({ isActive: true })
      if (!game) {
        return { text: 'Probablemente no hay sesiones abiertas', status: false }
      }
      const participants = game.participants
      const isParticipant = (element: Participants) => element.chatId === chatId
      if (!participants.some(isParticipant)) {
        return { text: 'Primero entra en el challenge y luego si pones retos ', status: false }
      }

      // const result = await this.challengeModel.findOne({ id })

      const incommingChallenges = challenges.map((challenge) => ({
        payload: challenge,
        isActive: true
      }))
      const currrentChallenges = game.challenges
      currrentChallenges.push(...incommingChallenges)

      await this.challengeModel.updateOne(
        {
          id: game.id
        },
        { challenges: currrentChallenges }
      )

      return { text: 'Listo, tus retos fueron guardados', status: true }
    } catch (error) {
      console.log('Error', error)
      return { text: 'Revisa que exista la sesion', status: false }
    }
  }

  addPenances = async ({ chatId, penances }: { chatId: string; penances: string[] }) => {
    try {
      const game = await this.challengeModel.findOne({ isActive: true })
      if (!game) {
        return { text: 'Probablemente no hay sesiones abiertas', status: false }
      }
      const participants = game.participants
      const isParticipant = (element: Participants) => element.chatId === chatId
      if (!participants.some(isParticipant)) {
        return {
          text: 'Primero entra en el challenge y luego si pones penitencias ',
          status: false
        }
      }

      // const result = await this.challengeModel.findOne({ id })

      const incommingPenances = penances.map((challenge) => ({
        payload: challenge,
        isActive: true
      }))
      const currrentPenances = game.penances
      currrentPenances.push(...incommingPenances)

      await this.challengeModel.updateOne(
        {
          id: game.id
        },
        { penances: currrentPenances }
      )

      return { text: 'Listo, tus penitencias fueron guardados', status: true }
    } catch (error) {
      console.log('Error', error)
      return { text: 'Revisa que exista la sesion', status: false }
    }
  }

  pickChallenges = async () => {
    try {
      const game = await this.challengeModel.findOne({ isActive: true })
      if (!game) {
        return { text: 'Probablemente no hay sesiones abiertas', status: false }
      }
      const challenges = game.challenges
      const participants = game.participants
      let filterParticipants = participants.filter((participant: any) => participant.isActive)
      const filterChallenges = challenges.filter((challenge: any) => challenge.isActive)

      if (filterChallenges.length === 0) return { text: 'El juego ha finalizado', status: false }

      if (filterParticipants.length === 0 && filterChallenges.length > 0) {
        // TODO reactive all the participants to begin the challenges again
        // console.log('We are activating all pariticipants again', participants)
        await Promise.all(
          participants.map(async (participant: any) => {
            await this.challengeModel.updateOne(
              { 'participants._id': participant._id },
              { $set: { 'participants.$.isActive': true } }
            )
          })
        )

        filterParticipants = participants
      }
      const challenge = filterChallenges[Math.floor(Math.random() * filterChallenges.length)]
      const participant = filterParticipants[Math.floor(Math.random() * filterParticipants.length)]

      console.log({
        quien: participant.name,
        que: challenge.payload,
        idParticipante: participant._id
      })

      await this.challengeModel.updateOne(
        { 'participants._id': participant._id },
        { $set: { 'participants.$.isActive': false } }
      )
      await this.challengeModel.updateOne(
        { 'challenges._id': challenge._id },
        { $set: { 'challenges.$.isActive': false } }
      )

      return {
        text: `${participant.name},debe ${challenge.payload}`,
        status: true,
        sendToParticipant: true,
        chatId: participant.chatId
      }
    } catch (error) {
      console.log('Error', error)
      return { text: 'Revisa que exista la sesion', status: false }
    }
  }

  pickPenances = async () => {
    try {
      const game = await this.challengeModel.findOne({ isActive: true })
      if (!game) {
        return { text: 'Probablemente no hay sesiones abiertas', status: false }
      }
      const penances = game.penances
      const filterPenances = penances.filter((penance: any) => penance.isActive)

      if (filterPenances.length === 0) return { text: 'Ya no hay más penitencias', status: false }

      const penance = filterPenances[Math.floor(Math.random() * filterPenances.length)]

      await this.challengeModel.updateOne(
        { 'challenges._id': penance._id },
        { $set: { 'challenges.$.isActive': false } }
      )

      return { text: `${penance.payload}`, status: true }
    } catch (error) {
      console.log('Error', error)
      return { text: 'Revisa que exista la sesion', status: false }
    }
  }

  closeGames = async () => {
    try {
      const games = await this.challengeModel.find({ isActive: true })
      await Promise.all(
        games.map(async (game: any) => {
          await this.challengeModel.updateOne({ _id: game._id }, { $set: { isActive: false } })
        })
      )
      return { text: 'la sesiones fueron cerradas ', status: true }
    } catch (error) {
      return { text: 'no pudimos cerrar todas las sesiones ', status: false }
    }
  }
}
