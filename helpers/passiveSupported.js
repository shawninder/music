// from https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
let passiveSupported = false

try {
  const options = {
    /* This function will be called when the browser
     * attempts to access the passive property.
     */
    get passive () {
      passiveSupported = true
    }
  }

  global.addEventListener('test', options, options)
  global.removeEventListener('test', options, options)
} catch (err) {
  passiveSupported = false
}
export default passiveSupported
