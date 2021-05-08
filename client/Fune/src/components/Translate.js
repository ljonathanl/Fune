import { h } from 'vue'

const language = 
    (
        navigator.userLanguage || 
        (navigator.languages && navigator.languages.length && navigator.languages[0]) || 
        navigator.language || navigator.browserLanguage || navigator.systemLanguage
    ).substring(0, 2) == 'fr' ? 'fr' : 'en'


const createTranslateComponent = (lang) => {
    return {
        render() {
            if (language != lang) 
                return
            return this.$slots.default()
        }
    }
}

const translate = (values) => {
    return values[language]
}

const fr = createTranslateComponent('fr')
const en = createTranslateComponent('en')

export {
    fr,
    en,
    language,
    translate
}
