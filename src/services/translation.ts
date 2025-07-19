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

export async function translate(text: string, sourceLanguage: string, targetLanguage: string) {
    await Promise.all([ensureModel(sourceLanguage), ensureModel(targetLanguage)])

    const { text: result } = await Translation.translate({
        text,
        sourceLanguage: map[sourceLanguage],
        targetLanguage: map[targetLanguage],
    })
    return result
}
