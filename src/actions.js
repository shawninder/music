import debounce from 'lodash.debounce'
import cloneDeep from 'lodash.clonedeep'
import { filter } from 'fuzzaldrin'
import trim from 'lodash.trim'
import pullAt from 'lodash.pullat'

import randomData from './random.json'

const useComponent = (type, dispatch) => {
  return (item) => {
    item.type = type
    item.key = item.id.videoId
    return item
  }
}

const hostKey = Math.random().toString()
const guestKey = Math.random().toString()

const search = function (action) {
  const val = action.data
  this.data.media.search(val)
    .then((results) => {
      const items = results.map(useComponent('YouTubeVideo', this.dispatch))
      this.setState({ items })
    })
}
const debouncedSearch = debounce(search, 500, { maxWait: 1000 })

function handler (fn) {
  return function handle (action, socket) {
    console.log('action', action)
    fn.call(this, action, socket)
  }
}
const actions = {
  App: {
    mergeState: {
      go: handler(function (action, socket) {
        this.setState(action.state)
        this.dispatch({
          type: 'App:saveState'
        })
        if (this.state.transmitting.name !== '') {
          socket.emit('state', {
            name: this.state.transmitting.name,
            hostKey,
            state: action.state
          })
        }
      })
    },
    saveState: {
      go: handler(function (action, socket) {
        localStorage.setItem('history', JSON.stringify(this.state.history))
        localStorage.setItem('playingNow', JSON.stringify(this.state.playingNow))
        localStorage.setItem('upNext', JSON.stringify(this.state.upNext))
        localStorage.setItem('t', JSON.stringify(this.state.t))
        localStorage.setItem('f', JSON.stringify(this.state.f))
        localStorage.setItem('playing', JSON.stringify(this.state.playing))
      })
    }
  },
  Music: {
    search: {
      go: search
    },
  },
  Omnibox: {
    suggest: {
      go: handler(function (action) {
        // TODO move these outta here
        const commands = {
          '/stopParty': () => {
            this.dispatch({
              type: 'Party.stop'
            })
          },
          '/leaveParty': () => {
            this.dispatch({
              type: 'Party:leave',
              data: this.state.attending
            })
          },
          '/clearHistory': () => {
            this.dispatch({
              type: 'Queue:clearHistory'
            })
          },
          '/clearUpNext': () => {
            this.dispatch({
              type: 'Queue:clearUpNext'
            })
          }
        }
        // end

        const val = trim(action.data)
        if (val === '') {
          debouncedSearch.cancel()
          this.setState({ items: [] })
        } else {
          if (val.startsWith('/')) {
            const all = [
              '/startParty',
              '/stopParty',
              '/joinParty',
              '/leaveParty',
              '/clearHistory',
              '/clearUpNext'
            ]
            const relevant = filter(all, val)
            const items = relevant.map((label) => {
              return {
                key: label,
                type: 'command',
                label,
                go: commands[label]
              }
            })
            this.setState({ items })
          } else {
            debouncedSearch.call(this, action)
          }
        }
      })
    },
    focus: {
      go: handler(function () {
        this.omnibox.field.focus()
      })
    },
    dismiss: {
      go: handler(function () {
        this.setState({ items: [] })
      })
    },
    clear: {
      go: handler(function () {
        this.omnibox.field.value = ''
      })
    }
  },
  Player: {
    setPlaying: {
      go: handler(function (action, socket) {
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              playing: true
            }
          })
        } else {
          this.setState({
            playing: true
          })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                playing: true
              }
            })
          }
        }
      })
    },
    setNotPlaying: {
      go: handler(function (action, socket) {
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              playing: false
            }
          })
        } else {
          this.setState({
            playing: false
          })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                playing: false
              }
            })
          }
        }
      })
    },
    togglePlay: {
      go: handler(function (action, socket) {
        if (this.state.playingNow) {
          const newPlaying = !this.state.playing
          if (this.state.attending.name !== '') {
            socket.emit('queryHost', {
              name: this.state.attending.name,
              guestKey,
              state: {
                playing: newPlaying,
              }
            })
          } else {
            this.setState({ playing: newPlaying })
            if (this.state.transmitting.name !== '') {
              socket.emit('state', {
                name: this.state.transmitting.name,
                hostKey,
                state: {
                  playing: newPlaying,
                }
              })
            }
          }
        } else {
          this.dispatch({
            type: 'Queue:next'
          })
        }
      })
    },
    toggleShow: {
      go: handler(function () {
        this.setState({ showPlayer: !this.state.showPlayer })
      })
    },
    play: {
      go: handler(function (action, socket) {
        const data = cloneDeep(action.data)
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            hostKey,
            state: {
              playingNow: data,
              playing: true,
            }
          })
        } else {
          this.setState({
            playingNow: data,
            playing: true
          })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                playingNow: data,
                playing: true,
              }
            })
          }
          localStorage.setItem('playingNow', JSON.stringify(data))
        }
      })
    },
    random: {
      go: handler(function (action) {
        const randomComponent = useComponent('YouTubeVideo', this.dispatch)
        const keys = Object.keys(this.state.collection)
        const len = keys.length
        if (len > 0) {
          // Play random song from collection
          const rdm = Math.random()
          const idx = Math.round(rdm * (len - 1))
          const item = this.state.collection[keys[idx]]
          this.dispatch({
            type: 'Player:play',
            data: randomComponent(item)
          })
        } else {
          // Play "random" song from randomData
          const rdm = Math.random()
          const idx = Math.round(rdm * (randomData.length - 1))
          const item = randomData[idx]
          this.dispatch({
            type: 'Player:play',
            data: randomComponent(item)
          })
        }
      })
    },
    progress: {
      go: handler(function (action, socket) {
        const data = action.data
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              f: data.played,
              t: data.playedSeconds
            }
          })
        } else {
          this.setState({
            f: data.played,
            t: data.playedSeconds
          })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                f: data.played,
                t: data.playedSeconds
              }
            })
          }
        }
      })
    }
  },
  Queue: {
    // history
    toHistory: {
      go: handler(function (action, socket) {
        let items = action.data
        if (!Array.isArray(items)) {
          items = [items]
        }
        const now = Date.now()
        const newHistory = this.state.history.concat(items.map((item, idx) => {
          item.key += `:${now}_${idx}`
          return item
        }))

        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              history: newHistory
            }
          })
        } else {
          this.setState({ history: newHistory })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                history: newHistory
              }
            })
          }
          localStorage.setItem('history', JSON.stringify(newHistory))
        }
      })
    },
    clearHistory: {
      go: handler(function (action, socket) {
        const newHistory = []
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              history: newHistory
            }
          })
        } else {
          this.setState({ history: newHistory })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                history: newHistory
              }
            })
          }
          localStorage.setItem('history', JSON.stringify(newHistory))
        }
      })
    },
    clearUpNext: {
      go: handler(function (action, socket) {
        const newUpNext = []
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              upNext: newUpNext
            }
          })
        } else {
          this.setState({ upNext: newUpNext })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                upNext: newUpNext
              }
            })
          }
          localStorage.setItem('upNext', JSON.stringify(newUpNext))
        }
      })
    },
    // upNext
    playNext: {
      go: handler(function (action, socket) {
        const data = cloneDeep(action.data)
        data.key += `:${Date.now()}`
        const newUpNext = [data].concat(this.state.upNext)
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              upNext: newUpNext
            }
          })
        } else {
          this.setState({
            upNext: newUpNext
          })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                upNext: newUpNext
              }
            })
          }
          localStorage.setItem('upNext', JSON.stringify(newUpNext))
        }
      })
    },
    enqueue: {
      go: handler(function (action, socket) {
        const data = action.data
        data.key += `:${Date.now()}`
        const newUpNext = this.state.upNext.concat([data])
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              upNext: newUpNext
            }
          })
        } else {
          this.setState({
            upNext: newUpNext
          })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                upNext: newUpNext
              }
            })
          }
          localStorage.setItem('upNext', JSON.stringify(newUpNext))
        }
      })
    },
    dequeue: {
      go: handler(function (action, socket) {
        const newUpNext = cloneDeep(this.state.upNext)
        pullAt(newUpNext, action.idx)
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              upNext: newUpNext
            }
          })
        } else {
          this.setState({
            upNext: newUpNext
          })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                upNext: newUpNext
              }
            })
          }
          localStorage.setItem('upNext', JSON.stringify(newUpNext))
        }
      })
    },
    // playback
    play: {
      go: handler(function (action) {
        const data = action.data
        if (this.state.playingNow && this.state.playingNow.key) {
          this.dispatch({
            type: 'Queue:toHistory',
            data: this.state.playingNow
          })
        }
        this.dispatch({
          type: 'Player:play',
          data
        })
      })
    },
    jumpTo: {
      go: handler(function (action, socket) {
        const data = action.data
        let skipped = []
        if (this.state.playingNow && this.state.playingNow.key) {
          skipped.push(this.state.playingNow)
        }
        if (this.state.upNext.length > 0) {
          skipped = skipped.concat(this.state.upNext.slice(0, action.idx))
          const newUpNext = this.state.upNext.slice(action.idx + 1)
          if (this.state.attending.name !== '') {
            socket.emit('queryHost', {
              name: this.state.attending.name,
              guestKey,
              state: {
                upNext: newUpNext
              }
            })
          } else {
            this.setState({ upNext: newUpNext })
            if (this.state.transmitting.name !== '') {
              socket.emit('state', {
                name: this.state.transmitting.name,
                hostKey,
                state: {
                  upNext: newUpNext
                }
              })
            }
            localStorage.setItem('upNext', JSON.stringify(newUpNext))
          }
        }
        if (skipped.length > 0) {
          this.dispatch({
            type: 'Queue:toHistory',
            data: skipped
          })
        }

        this.dispatch({
          type: 'Player:play',
          data
        })
      })
    },
    next: {
      go: handler(function (action, socket) {
        const history = this.state.history
        let playingNow = this.state.playingNow
        const upNext = this.state.upNext
        let playing = this.state.playing
        let playRandom = false
        if (playingNow && playingNow.key) {
          playingNow.key += `:${Date.now()}`
          history.push(cloneDeep(playingNow))
        }
        if (upNext.length > 0) {
          const next = upNext.shift()
          playingNow = next
        } else {
          playRandom = true
        }
        if (this.state.attending.name !== '') {
          socket.emit('queryHost', {
            name: this.state.attending.name,
            guestKey,
            state: {
              history,
              playingNow,
              playing,
              upNext
            }
          })
        } else {
          this.setState({
            history,
            playingNow,
            upNext,
            playing
          })
          if (this.state.transmitting.name !== '') {
            socket.emit('state', {
              name: this.state.transmitting.name,
              hostKey,
              state: {
                history,
                playingNow,
                playing,
                upNext
              }
            })
          }
          localStorage.setItem('history', JSON.stringify(history))
          localStorage.setItem('playingNow', JSON.stringify(playingNow))
          localStorage.setItem('upNext', JSON.stringify(upNext))
        }
        if (playRandom) {
          this.dispatch({
            type: 'Player:random'
          })
        }
      })
    },
    prev: {
      go: handler(function (action, socket) {
        const len = this.state.history.length
        if (len === 0 || (this.state.t > 3 && !this.state.attending.name)) {
          this.playerEl.seekTo(0)
        } else {
          const history = this.state.history
          const playingNow = this.state.playingNow
          const upNext = this.state.upNext
          const previous = cloneDeep(history.pop())
          previous.key = `${previous.key.substr(0, previous.key.lastIndexOf(':'))}:${Date.now()}`
          if (playingNow && playingNow.key) {
            upNext.unshift(playingNow)
          }
          this.dispatch({
            type: 'Player:play',
            data: previous
          })
          if (this.state.attending.name !== '') {
            socket.emit('queryHost', {
              name: this.state.attending.name,
              guestKey,
              state: {
                history,
                upNext
              }
            })
          } else {
            this.setState({
              history,
              upNext
            })
            if (this.state.transmitting.name !== '') {
              socket.emit('state', {
                name: this.state.transmitting.name,
                hostKey,
                state: {
                  history,
                  upNext
                }
              })
            }
            localStorage.setItem('history', JSON.stringify(history))
            localStorage.setItem('upNext', JSON.stringify(upNext))
          }
        }
      })
    },
  },
  History: {
    toggle: {
      go: handler(function (action) {
        const showHistory = !this.state.showHistory
        this.setState({
          showHistory
        })
        localStorage.setItem('showHistory', JSON.stringify(showHistory))
      })
    }
  },
  UpNext: {
    toggle: {
      go: handler(function (action) {
        const showUpNext = !this.state.showUpNext
        this.setState({
          showUpNext
        })
        localStorage.setItem('showUpNext', JSON.stringify(showUpNext))
      })
    }
  },
  Collection: {
    toggle: {
      go: handler(function (action) {
        const key = action.data.id.videoId
        const collection = this.state.collection
        if (collection[key]) {
          delete collection[key]
          const obj = { collection }
          this.setState(obj)
        } else {
          collection[key] = action.data
          const obj = { collection }
          this.setState(obj)
        }
        localStorage.setItem('collection', JSON.stringify(collection))
      })
    }
  },
  Party: {
    start: {
      go: handler(function (action, socket) {
        socket.emit('startParty', {
          name: action.data.name,
          hostKey,
          state: {
            history: this.state.history,
            playingNow: this.state.playingNow,
            playing: this.state.playing,
            f: this.state.f,
            t: this.state.t,
            upNext: this.state.upNext
          }
        })
      })
    },
    stop: {
      go: handler(function (action, socket) {
        socket.emit('stopParty', {
          name: this.state.transmitting.name,
          hostKey
        })
      })
    },
    join: {
      go: handler(function (action, socket) {
        this.setState({
          saved: {
            history: this.state.history,
            playingNow: this.state.playingNow,
            playing: false,
            f: this.state.f,
            t: this.state.t,
            upNext: this.state.upNext,
            includePlayer: true,
            attending: {
              name: ''
            },
            transmitting: {
              name: ''
            }
          }
        })
        socket.emit('joinParty', {
          name: action.data.name,
          guestKey,
        })
      })
    },
    leave: {
      go: handler(function (action, socket) {
        socket.emit('leaveParty', {
          name: this.state.attending.name,
          guestKey
        })
      })
    },
    auto: {
      go: handler(function (action, socket) {
        socket.emit('isParty', {
          name: action.data.name,
          guestKey,
          hostKey
        })
      })
    }
  }
}

export default actions
