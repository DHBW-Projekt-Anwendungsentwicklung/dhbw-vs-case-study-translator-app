<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Übersetzer-App</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list lines="none">
        <ion-item>
          <ion-select
            v-model="sourceLanguage"
            interface="popover"
            placeholder="Auswahl Quellsprache"
          >
            <ion-select-option value="de">Deutsch</ion-select-option>
            <ion-select-option value="en">Englisch</ion-select-option>
            <ion-select-option value="fr">Französisch</ion-select-option>
            <ion-select-option value="it">Italienisch</ion-select-option>
            <ion-select-option value="es">Spanisch</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <ion-item lines="none">
        <ion-textarea
          v-model="sourceText"
          placeholder="Text hier eingeben"
          auto-grow
        ></ion-textarea>
      </ion-item>

      <ion-list lines="none" class="top-gap">
        <ion-item>
          <ion-select
            v-model="targetLanguage"
            interface="popover"
            placeholder="Auswahl Zielsprache"
          >
            <ion-select-option value="de">Deutsch</ion-select-option>
            <ion-select-option value="en">Englisch</ion-select-option>
            <ion-select-option value="fr">Französisch</ion-select-option>
            <ion-select-option value="it">Italienisch</ion-select-option>
            <ion-select-option value="es">Spanisch</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <ion-item lines="none">
        <ion-textarea
          readonly
          v-model="translatedText"
          placeholder="Übersetzung"
          auto-grow
        ></ion-textarea>
      </ion-item>

      <ion-button expand="block" class="top-gap" @click="copyToClipboard">
        Kopieren
      </ion-button>
      <ion-button expand="block" @click="speakText">
        Sprachausgabe
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonSelect, IonSelectOption,
  IonTextarea, IonButton, loadingController, toastController
} from '@ionic/vue'

const sourceLanguage = ref('')
const targetLanguage = ref('')
const sourceText = ref('')
const translatedText = ref('')

function debounce(fn: (...a: any[]) => any, d = 300) {
  let t: ReturnType<typeof setTimeout> | undefined
  return (...a: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...a), d)
  }
}

async function translate(text: string, from: string, to: string) {
  await new Promise(r => setTimeout(r, 400))
  return `[${from}→${to}] ${text}`
}

const debouncedTranslate = debounce(async () => {
  if (!sourceText.value || !sourceLanguage.value || !targetLanguage.value) {
    translatedText.value = ''
    return
  }
  const loader = await loadingController.create({ message: 'Übersetze …' })
  await loader.present()
  try {
    translatedText.value = await translate(
      sourceText.value,
      sourceLanguage.value,
      targetLanguage.value
    )
  } catch {
    const toast = await toastController.create({
      message: 'Übersetzung fehlgeschlagen',
      color: 'danger',
      duration: 2500
    })
    toast.present()
  } finally {
    loader.dismiss()
  }
}, 300)

watch([sourceText, sourceLanguage, targetLanguage], debouncedTranslate)

async function copyToClipboard () {}
async function speakText () {}
</script>

<style scoped>
.top-gap {
  margin-top: 24px;
}
</style>
