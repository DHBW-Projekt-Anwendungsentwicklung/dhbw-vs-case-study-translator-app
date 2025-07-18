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
          auto-grow
          :rows="5"
        ></ion-textarea>
      </ion-item>

      <div class="divider">
        <div class="line"></div>
        <ion-button fill="clear" size="small" class="swap-button">
          <ion-icon :icon="swapVertical" size="large"></ion-icon>
        </ion-button>
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
            auto-grow
            :rows="5"
          ></ion-textarea>
        </ion-item>

        <ion-button fill="clear" size="small" class="mini copy-btn">
          <ion-icon :icon="copyOutline"></ion-icon>
        </ion-button>

        <ion-button fill="clear" size="small" class="mini speak-btn">
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
  IonList, IonItem, IonSelect, IonSelectOption,
  IonTextarea, IonButton, loadingController, toastController
} from '@ionic/vue'
import { swapVertical, copyOutline, volumeHighOutline } from 'ionicons/icons'

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
  width: 40px;
  height: 40px;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #c8c8c8;
  background: #ffffff;
  padding-start: 6px;
  padding-end: 6px;
  z-index: 10;
}
.copy-btn  { right: 68px; bottom: 6px; }
.speak-btn { right: 20px; bottom: 6px; }
.mini ion-icon {
  font-size: 20px;
  color: var(--ion-color-medium);
}
</style>
