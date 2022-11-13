export const messageHandler = async (message: string) => {
  if (message == 'Iniciar reto') {
    console.log('Fue trigger de crear el reto ')
    return 'debe crearse una sesion'
  }

  return 'creo que es otro mensaje'
}
