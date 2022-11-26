export const mappingMessage = {
  addParticipant: ['hola', 'soy,', 'juego']
}

export const correlationFunction = (message: string, keywords: string[]) => {
  const match: boolean[] = []
  keywords.map((keyword) => {
    const isInMeessage = message.includes(keyword)
    match.push(isInMeessage)
  })
  return match.every((el) => el === true)
}

export const getWordAfter = (message: string, keyword: string) => {
  const words = message.split(' ')
  const beforeNameIndex = words.findIndex((key) => key === keyword)
  return words[beforeNameIndex + 1]
}

export const isGroup = (chatId: string): Boolean => {
  return chatId.includes('g')
}

export const getNumber = (chatId: string): string | null => {
  const numberPattern = /\d+/g

  const numberArray = chatId.match(numberPattern)
  if (numberArray) return numberArray[0]
  return null
}
