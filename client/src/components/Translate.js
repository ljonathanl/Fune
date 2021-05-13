import { h, ref } from 'vue'

const language = ref('en')

const createTranslateComponent = (lang) => {
    return {
        render() {
            if (language.value != lang) 
                return
            return this.$slots.default()
        }
    }
}

const translate = (values) => {
    return values[language.value]
}

const setLanguage = (ln) => {
    language.value = ln == 'fr' ? 'fr' : 'en'
}

setLanguage((
    navigator.userLanguage || 
    (navigator.languages && navigator.languages.length && navigator.languages[0]) || 
    navigator.language || navigator.browserLanguage || navigator.systemLanguage
).substring(0, 2))

const fr = createTranslateComponent('fr')
const en = createTranslateComponent('en')

export {
    fr,
    en,
    language,
    translate,
    setLanguage
}
