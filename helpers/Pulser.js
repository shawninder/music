function Pulser (pulse) {
  return {
    delay: 30000,
    start: function (delay) {
      this.timestamp = Date.now()
      this.timeout = global.setTimeout(() => {
        pulse()
        this.start(this.delay)
      }, delay || this.delay)
    },
    stop: function () {
      if (this.timeout) {
        global.clearTimeout(this.timeout)
      }
      if (this.timestamp) {
        this.timestamp = null
      }
    },
    setDelay: function (newDelay) {
      if (this.timeout && this.timestamp) {
        global.clearTimeout(this.timeout)
        const now = Date.now()
        const diff = now - this.timestamp

        if (diff > newDelay) {
          pulse()
          this.start(newDelay)
        } else {
          this.start(newDelay - diff)
        }
      } else {
        this.start(newDelay)
      }
      this.delay = newDelay
    }
  }
}

export default Pulser
