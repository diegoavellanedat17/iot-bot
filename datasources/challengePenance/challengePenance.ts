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
  id: string
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
    console.log('Calling create sesion')
    const sessionName = uniqueNamesGenerator(customConfigGenerator)
    console.log('la sesion creada es: ', sessionName)
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
    console.log('Updating')
    await this.challengeModel.updateOne({ id }, { isActive: true })
  }
  addParticipant = async ({ id, participant, chatId }: AddParticipantParameters) => {
    const result = await this.challengeModel.findOne({ id })
    const participants = result.participants
    participants.push({ name: participant, isActive: true, chatId })
    await this.challengeModel.updateOne(
      {
        id
      },
      { participants }
    )
    console.log(result)
  }
  addChallenges = async ({ id, challenges }: { id: string; challenges: string[] }) => {
    const result = await this.challengeModel.findOne({ id })
    const incommingChallenges = challenges.map((challenge) => ({
      payload: challenge,
      isActive: true
    }))
    const currrentChallenges = result.challenges
    currrentChallenges.push(...incommingChallenges)
    console.log('los current challenges ', currrentChallenges)
    await this.challengeModel.updateOne(
      {
        id
      },
      { challenges: currrentChallenges }
    )
    console.log(result)
  }

  addPenances = async ({ id, penances }: { id: string; penances: string[] }) => {
    const result = await this.challengeModel.findOne({ id })
    const incommingPenances = penances.map((penance) => ({
      payload: penance,
      isActive: true
    }))
    const currrentPenances = result.penances
    currrentPenances.push(...incommingPenances)
    await this.challengeModel.updateOne(
      {
        id
      },
      { penances: currrentPenances }
    )
    console.log(result)
  }

  pickChallenges = async (id: string) => {
    const document = await this.challengeModel.findOne({ id: id })

    const challenges = document.challenges
    const participants = document.participants
    let filterParticipants = participants.filter((participant: any) => participant.isActive)
    const filterChallenges = challenges.filter((challenge: any) => challenge.isActive)

    if (filterChallenges.length === 0) return { status: 'Finish Game' }

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
      console.log('participants updated')
      filterParticipants = participants
    }
    const challenge = filterChallenges[Math.floor(Math.random() * filterChallenges.length)]
    const participant = filterParticipants[Math.floor(Math.random() * filterParticipants.length)]

    console.log({
      quien: participant.name,
      que: challenge.payload,
      idParticipante: participant._id
    })
    //sdsssdasdsxsdffddsdsasddsdsa
    console.log('Deactivating')
    await this.challengeModel.updateOne(
      { 'participants._id': participant._id },
      { $set: { 'participants.$.isActive': false } }
    )
    await this.challengeModel.updateOne(
      { 'challenges._id': challenge._id },
      { $set: { 'challenges.$.isActive': false } }
    )
  }
}
