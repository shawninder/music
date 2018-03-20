import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultProps, propTypes } from './helpers'
import get from 'lodash.get'
import cloneDeep from 'lodash.clonedeep'

import './App.css'
import actions from './actions'
import Media from './data/Media'
import Omnibox from './components/Omnibox'
import Player from './components/Player'
import Controls from './components/Controls'
import List from './components/List'
import Party from './components/Party'

import YouTubeVideo from './components/YouTubeVideo'
import StartParty from './components/StartParty'
import StopParty from './components/StopParty'
import JoinParty from './components/JoinParty'
import LeaveParty from './components/LeaveParty'

import actionable from './components/actionable'
import play from './mixins/play'
import jumpTo from './mixins/jumpTo'
import playNext from './mixins/playNext'
import enqueue from './mixins/enqueue'
import remember from './mixins/remember'
import remove from './mixins/remove'
import dismiss from './mixins/dismiss'

import io from 'socket.io-client'

import Dict from './Dict.js'
import contents from './contents'

const dict = new Dict(contents, ['en', 'fr', 'es'])

const socket = io('https://party-server-tvngiafxzh.now.sh')

class ClearHistory extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }
  onClick () {
    this.props.dispatch({
      type: 'Queue:clearHistory'
    })
  }
  render () {
    return (
      <div
        key="clearHistory"
        className="clearHistory"
        onClick={this.onClick}
      >
        /clearHistory
      </div>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

ClearHistory.defaultProps = defaultProps(props)
ClearHistory.propTypes = propTypes(props)

class ClearUpNext extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }
  onClick () {
    this.props.dispatch({
      type: 'Queue:clearUpNext'
    })
  }
  render () {
    return (
      <div
        key="clearUpNext"
        className="clearUpNext"
        onClick={this.onClick}
      >
        /clearUpNext
      </div>
    )
  }
}

const cleanUpNextProps = [
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

ClearUpNext.defaultProps = defaultProps(cleanUpNextProps)
ClearUpNext.propTypes = propTypes(cleanUpNextProps)

const commandComponents = {
  '/startParty': StartParty,
  '/stopParty': StopParty,
  '/joinParty': JoinParty,
  '/leaveParty': LeaveParty,
  '/clearHistory': ClearHistory,
  '/clearUpNext': ClearUpNext
}

class App extends Component {
  constructor (props) {
    super(props)
    this.dispatch = this.dispatch.bind(this)
    this.keyDown = this.keyDown.bind(this)

    this.actions = actions

    this.data = {
      media: new Media()
    }

    this.omnibox = {}

    let history = []
    try {
      const str = localStorage.getItem('history')
      if (str) {
        history = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    let playingNow = {}
    try {
      const str = localStorage.getItem('playingNow')
      if (str) {
        playingNow = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    let upNext = []
    try {
      const str = localStorage.getItem('upNext')
      if (str) {
        upNext = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    let showHistory = false
    try {
      const str = localStorage.getItem('showHistory')
      if (str) {
        showHistory = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    let showUpNext = false
    try {
      const str = localStorage.getItem('showUpNext')
      if (str) {
        showUpNext = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    let collection = {}
    try {
      const str = localStorage.getItem('collection')
      if (str) {
        collection = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    let showPlayer = true
    try {
      const str = localStorage.getItem('showPlayer')
      if (str) {
        showPlayer = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    let includePlayer = true

    let transmitting = {
      name: ''
    }
    try {
      const str = localStorage.getItem('transmitting')
      if (str) {
        transmitting = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    let attending = {
      name: ''
    }
    try {
      const str = localStorage.getItem('attending')
      if (str) {
        attending = JSON.parse(str)
      }
    } catch (ex) {
      // ignore
    }

    this.state = {
      items: [],
      history,
      showHistory,
      playingNow,
      t: 0,
      upNext,
      showUpNext,
      playing: false,
      collection,
      showPlayer,
      includePlayer,
      transmitting,
      attending
    }

    // party shared state
    socket.on('connect', () => {
      console.log('connected to socket')
    })

    socket.on('connect_error', () => {
      this.dispatch({
        type: 'Party:broken'
      })
    })

    socket.on('reconnect_failed', () => {
      console.log('reconnect_failed')
    })

    socket.on('disconnect', () => {
      console.log('Lost socket connection')
    })

    socket.on('oops', (data) => {
      console.log('oops', data)
    })

    socket.on('success', (data) => {
      console.log('SUCCESS', data)
    })

    socket.on('party', (party) => {
      if (party.exists) {
        this.dispatch({
          type: 'Party:join',
          data: {
            name: party.name
          }
        })
      } else {
        this.dispatch({
          type: 'Party:start',
          data: {
            name: party.name
          }
        })
      }
    })

    socket.on('partyCreated', (data) => {
      const transmitting = {
        name: data.name
      }
      this.setState({ transmitting })
      localStorage.setItem('transmitting', JSON.stringify(transmitting))
    })

    socket.on('endedParty', () => {
      const transmitting = {
        name: ''
      }
      this.setState({ transmitting })
      localStorage.setItem('transmitting', JSON.stringify(transmitting))
    })

    socket.on('partyEnded', () => {
      this.dispatch({
        type: 'App:pop'
      })
    })

    socket.on('leftParty', () => {
      this.setState(this.state.saved)
      this.dispatch({
        type: 'App:saveState'
      })
    })

    socket.on('state', (state) => {
      this.setState(state)
    })

    socket.on('joinedParty', (party) => {
      const attending = {
        name: party.name,
      }
      this.setState({
        includePlayer: false,
        attending
      })
      localStorage.setItem('attending', JSON.stringify(attending))
    })

    socket.on('guestRequest', (state) => {
      this.dispatch({
        type: 'App:mergeState',
        state
      })
    })

    socket.on('malformed', (data) => {

    })

    socket.on('*', function () {
      console.log('Unknown REMOTE EVENT', arguments)
    })
    // end

    global.state = () => {
      return this.state
    }
  }

  componentDidMount () {
    global.addEventListener('keydown', this.keyDown, false)

    if (!!this.state.transmitting.name) {
      this.dispatch({
        type: 'Party:start',
        data: {
          name: this.state.transmitting.name
        }
      })
    }

    if (!!this.state.attending.name) {
      this.dispatch({
        type: 'Party:join',
        data: {
          name: this.state.attending.name
        }
      })
    }
  }

  componentWillUnmount () {
    global.removeEventListener('keydown', this.keyDown, false)
  }

  dispatch (action) {
    const go = get(this.actions, `${action.type.replace(':','.')}.go`)
    if (go) {
      go.call(this, action, socket)
    } else {
      console.error('Unknown action', action)
    }
  }

  keyDown (event) {
    // TODO This should be taken care of by the omnibox
    if (!this.omnibox.el.contains(event.target)) {
      if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
        this.dispatch({
          type: 'Omnibox:focus'
        })
      }
      if (event.keyCode === 32 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // space
        event.preventDefault()
        this.dispatch({
          type: 'Player:togglePlay'
        })
      }
      if (event.keyCode === 39 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // right
        this.dispatch({
          type: 'Queue:next'
        })
      }
      if (event.keyCode === 37 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // left
        event.stopPropagation()
        this.dispatch({
          type: 'Queue:prev'
        })
      }
    }
  }

  render () {
    return (
      <div className="App">
        <Omnibox
          onRef={(name, ref) => {
            this.omnibox[name] = ref
          }}
          dispatch={this.dispatch}
          autoFocus
          items={this.state.items}
          getComponent={(item, idx) => {
            switch (item.type) {
              case 'YouTubeVideo':
                return actionable(YouTubeVideo, [play(), dismiss()], [
                  playNext(), enqueue(), remember(this.state.collection)
                ])
              case 'command':
                const Component = commandComponents[item.label]
                if (!Component) {
                  throw new Error(`Unrecognized command ${item.label}`)
                }
                return Component
              default:
                throw new Error(`Unrecognized item type ${item.type}`)
            }
          }}
          placeholder={dict.get('omnibox.placeholder')}
        />
        <div className="main">
          <Party
            className="autoparty"
            placeholder={dict.get('party.placeholder')}
            attending={this.state.attending}
            transmitting={this.state.transmitting}
            dispatch={this.dispatch}
            dict={dict}
            defaultValue={this.state.attending.name || this.state.transmitting.name || ''}
          />
          { this.state.includePlayer
            ? (
              <Player
                onRef={(playerEl) => {
                  this.playerEl = playerEl
                }}
                playingNow={this.state.playingNow}
                playing={this.state.playing}
                dispatch={this.dispatch}
                show={this.state.showPlayer}
              />
            )
            : (
              (this.state.showPlayer && this.state.playingNow.snippet)
                ? (
                  <img
                    className="player-alt"
                    src={this.state.playingNow.snippet.thumbnails.high.url}
                    width={this.state.playingNow.snippet.thumbnails.high.width}
                    height={this.state.playingNow.snippet.thumbnails.high.height}
                    alt={`Thumnail for ${this.state.playingNow.title}`}
                  />
                )
                : null
            )
          }
          <div className="queue">
          {
            this.state.showHistory
              ? (
                <List
                  title={dict.get('history.title')}
                  className="history"
                  items={cloneDeep(this.state.history).reverse()}
                  dispatch={this.dispatch}
                  getComponent={(item, idx) => {
                    return actionable(YouTubeVideo, play(), [
                      playNext(), enqueue(), remember(this.state.collection)
                    ])
                  }}
                />
              )
              : null
          }
          { this.state.showUpNext
            ? (
              <List
                title={dict.get('upnext.title')}
                className="upNext"
                items={this.state.upNext}
                dispatch={this.dispatch}
                getComponent={(item, idx) => {
                  return actionable(YouTubeVideo, jumpTo(idx), [
                    remember(this.state.collection), remove(idx)
                  ])
                }}
              />
            )
            : null
          }
          </div>
        </div>
        <Controls
          playingNow={this.state.playingNow}
          f={this.state.f}
          playing={this.state.playing}
          dispatch={this.dispatch}
          collection={this.state.collection}
          showPlayer={this.state.showPlayer}
          history={this.state.history}
          upNext={this.state.upNext}
        />
      </div>
    )
  }
}

export default App
