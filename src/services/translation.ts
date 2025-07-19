import { Translation, Language } from '@capacitor-mlkit/translation'

const map: Record<string, Language> = {
    de: Language.German,
    en: Language.English,
    fr: Language.French,
    it: Language.Italian,
    es: Language.Spanish,
}

const downloaded = new Set<string>()

async function ensureModel(code: string) {
    if (downloaded.has(code)) return
    await Translation.downloadModel({ language: map[code] })
    downloaded.add(code)
}

export async function translate(
    text: string, sourceLanguage: string, targetLanguage: string,
    onDownload?: (downloading: boolean) => void
) {
    const need = [sourceLanguage, targetLanguage].filter(code => !downloaded.has(code))
    if (need.length && onDownload) onDownload(true)
    await Promise.all(
    need.map(async code => {
      await Translation.downloadModel({ language: map[code] })
      downloaded.add(code)
    })
  )
  if (need.length && onDownload) onDownload(false)
const { text: result } = await Translation.translate({
    text, sourceLanguage: map[sourceLanguage], targetLanguage: map[targetLanguage],
  })
  return result
}
