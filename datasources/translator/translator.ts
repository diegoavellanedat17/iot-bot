import axios from 'axios'

export const translateMessage = async (message: string): Promise<string | null> => {
  const encodedParams = new URLSearchParams()
  encodedParams.append('q', message)
  encodedParams.append('target', 'es')
  encodedParams.append('source', 'en')

  const options = {
    method: 'POST',
    url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept-Encoding': 'application/gzip',
      'X-RapidAPI-Key': '154db6a8bamshf1981f24622044fp130b24jsnd9fa24771d44',
      'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
    },
    data: encodedParams
  }

  const response = await axios.request(options)
  console.log(response.data.data)

  if (response.data) return response.data.data.translations[0].translatedText
  return null
}
