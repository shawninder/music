import acceptLanguageParser from 'accept-language-parser'

function langonly (str) {
  return str.split('-')[0]
}

export function guessLang (avail, acceptLanguage, navigator) {
  let guess = null
  if (acceptLanguage) {
    guess = acceptLanguageParser.pick(avail, acceptLanguage, { loose: true })
  }
  if (!guess) {
    if (navigator) {
      // TODO cleanup
      const languages = navigator.languages.map(langonly)
      const preferred = langonly(navigator.language)

      if (avail.includes(preferred)) {
        guess = preferred
      } else {
        let found = false
        for (let i = 0, len = languages.length; i < len && !found; i += 1) {
          const language = languages[i]
          if (avail.includes(language)) {
            found = true
            guess = language
          }
        }
        if (!found) {
          guess = avail[0]
        }
      }
      // guess = 'es'
      console.log('guess', guess)
    }
  }
  return guess
}

class Dict {
  constructor (contents, avail, acceptLanguage, navigator) {
    this.contents = contents
    this.avail = avail

    this.using = guessLang(this.avail, acceptLanguage, navigator)
  }

  get (key) {
    return this.contents[key][this.using]
  }
}

export default Dict
