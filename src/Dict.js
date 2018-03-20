function langonly (str) {
  return str.split('-')[0]
}

const languages = window.navigator.languages.map(langonly)
const preferred = langonly(window.navigator.language)

class Dict {
  constructor (contents, avail) {
    this.contents = contents
    this.avail = avail
    if (this.avail.includes(preferred)) {
      this.using = preferred
    } else {
      let found = false
      for (let i = 0, len = languages.length; i < len && !found; i += 1) {
        const language = languages[i]
        if (this.avail.includes(language)) {
          found = true
          this.using = language
        }
      }
      if (!found) {
        this.using = this.avail[0]
      }
    }
    // this.using = 'es'
    // console.log('this.using', this.using)
  }
  get (key) {
    return this.contents[key][this.using]
  }
}

export default Dict
