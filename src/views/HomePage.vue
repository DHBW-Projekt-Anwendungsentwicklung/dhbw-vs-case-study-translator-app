<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar class="app-toolbar">
        <ion-title class="app-title">Übersetzer-App</ion-title>
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
          class="text-fields"
          v-model="sourceText"
          placeholder="Text hier eingeben"
          :rows="5"
        ></ion-textarea>
      </ion-item>

      <div class="divider">
        <div class="line"></div>
        <ion-button fill="clear" size="small" class="swap-button" @click="swapLanguages">
          <ion-icon :icon="swapVertical" size="large"></ion-icon>
        </ion-button>
        <ion-toast
        :is-open="toastOpen"
        message="Text in die Zwischenablage kopiert"
        position="bottom"
        :duration="2000"
        @didDismiss="toastOpen = false"
        />
        <div class="line"></div>
      </div>

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

      <div class="target-box">
        <ion-item lines="none">
          <ion-textarea
            class="text-fields"
            readonly
            v-model="translatedText"
            placeholder="Übersetzung"
            :rows="5"
          ></ion-textarea>
          <ion-spinner v-if="isDownloadingModel || isTranslating"
             name="dots"
             class="translate-spinner"/>
        </ion-item>

        <ion-button fill="clear" size="small" class="mini copy-button" @click="copyToClipboard">
          <ion-icon :icon="copyOutline"></ion-icon>
        </ion-button>

        <ion-button fill="clear" size="small" class="mini speak-button" @click="speakText">
          <ion-icon :icon="volumeHighOutline"></ion-icon>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonSelect, IonSelectOption, onIonViewDidEnter,
  IonTextarea, IonButton, loadingController, toastController
} from '@ionic/vue'
import { Clipboard } from '@capacitor/clipboard'
import { swapVertical, copyOutline, volumeHighOutline } from 'ionicons/icons'
import { translate as mlkitTranslation} from '@/services/translation'
import { SpeechSynthesis, QueueStrategy } from '@capawesome-team/capacitor-speech-synthesis'

const sourceLanguage = ref('')
const targetLanguage = ref('')
const sourceText = ref('')
const translatedText = ref('')
const toastOpen = ref(false)
const isDownloadingModel = ref(false)
const isTranslating = ref(false)

onIonViewDidEnter(async () => {
  try {
    await SpeechSynthesis.initialize()
  } catch {
    const t = await toastController.create({
      message: 'Sprachausgabe nicht verfügbar',
      duration: 2000,
      color: 'warning'
    })
    t.present()
  }
})

function debounce(fn: (...a: any[]) => any, d = 500) {
  let t: ReturnType<typeof setTimeout> | undefined
  return (...a: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...a), d)
  }
}

const debouncedTranslate = debounce(async () => {
  if (!sourceText.value || !sourceLanguage.value || !targetLanguage.value) {
    translatedText.value = ''
    return
  }

  isTranslating.value = true
  translatedText.value = 'Übersetze …'

  try {
    translatedText.value = await mlkitTranslation(
      sourceText.value,
      sourceLanguage.value,
      targetLanguage.value,
      (flag: boolean) => isDownloadingModel.value = flag
    )
  } catch {
    translatedText.value = ''
  } finally {
    isTranslating.value = false
  }
}, 300)

function swapLanguages() {
  const tmp = sourceLanguage.value
  sourceLanguage.value = targetLanguage.value
  targetLanguage.value = tmp
  sourceText.value = translatedText.value
}

watch([sourceText, sourceLanguage, targetLanguage], debouncedTranslate)

async function copyToClipboard() {
  await Clipboard.write({ string: translatedText.value })
  const toast = await toastController.create({
    message: 'Text in die Zwischenablage kopiert',
    duration: 2000,
    color: 'dark'
  })
  await toast.present()
}

const langTag: Record<string,string> = {
  de: 'de-DE',
  en: 'en-US',
  fr: 'fr-FR',
  it: 'it-IT',
  es: 'es-ES',
}

async function speakText () {
  if (!translatedText.value) return
  try {
    await SpeechSynthesis.speak({
      text: translatedText.value,
      language: langTag[targetLanguage.value] ?? targetLanguage.value,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      queueStrategy: QueueStrategy.Flush
    })
  } catch {
    const t = await toastController.create({
      message: 'Vorlesen fehlgeschlagen',
      duration: 2500,
      color: 'danger'
    })
    t.present()
  }
}

</script>

<style scoped>
.app-toolbar {
  padding-top: calc(env(safe-area-inset-top) + 20px);
  min-height: 64px;
}
.app-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #000000;
}
.text-fields {
  background-color: #F5F5F5;
  border: 1px solid #808080;
  border-radius: 6px;
  padding: 6px;

  height: 150px;             
  overflow-y: auto;          
  resize: none;              
}
.divider {
  display: flex;
  align-items: center;
  margin: 28px 0;
}
.divider .line {
  flex: 1;
  height: 1px;
  background: #c8c8c8;
}
.swap-button {
  padding-start: 6px;
  padding-end: 6px;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  box-shadow: 0 0 0 1px #c8c8c8;
  margin: 0 12px;
}
.swap-button ion-icon {
  font-size: 20px;
  color: var(--ion-color-medium);
}
.top-gap {
  margin-top: 24px;
}
.target-box {
  position: relative;
  margin-top: 12px;
}
.mini {
  position: absolute;
  bottom: 12px;
  width: 35px;
  height: 35px;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #c8c8c8;
  background: #ffffff;
  padding-start: 6px;
  padding-end: 6px;
  z-index: 10;
}
.copy-button  { right: 68px; bottom: 6px; }
.speak-button { right: 20px; bottom: 6px; }
.mini ion-icon {
  font-size: 20px;
  color: var(--ion-color-medium);
}
.translate-spinner {
  position: absolute;
  right: 50%;
  bottom: 8px;
  transform: translateX(50%);
}
</style>
