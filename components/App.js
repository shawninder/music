import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import cloneDeep from 'lodash.clonedeep'
import pullAt from 'lodash.pullat'

import Bar from '../components/Bar'
import Player from '../components/Player'
import Controls from '../components/Controls'
import List from '../components/List'
import Party from '../components/Party'

import makeResultComponent from '../components/makeResultComponent'

import Dict from '../data/Dict.js'

const isServer = typeof window === 'undefined'

class App extends Component {
  static getInitialProps ({ req, res }) {
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    return { headers, acceptLanguage }
  }

  constructor (props) {
    super(props)
    this.keyDown = this.keyDown.bind(this)
    this.play = this.play.bind(this)
    this.togglePlaying = this.togglePlaying.bind(this)
    this.playNext = this.playNext.bind(this)
    this.enqueue = this.enqueue.bind(this)
    this.dequeue = this.dequeue.bind(this)
    this.remember = this.remember.bind(this)
    this.isInCollection = this.isInCollection.bind(this)
    this.toggleShowPlayer = this.toggleShowPlayer.bind(this)
    this.clearHistory = this.clearHistory.bind(this)
    this.clearUpNext = this.clearUpNext.bind(this)
    this.toggleShowHistory = this.toggleShowHistory.bind(this)
    this.toggleShowUpNext = this.toggleShowUpNext.bind(this)
    this.jumpTo = this.jumpTo.bind(this)
    this.jumpBackTo = this.jumpBackTo.bind(this)
    this.restartTrack = this.restartTrack.bind(this)
    this.onTrackEnd = this.onTrackEnd.bind(this)

    this.bar = {}

    this.dict = new Dict(props.dict.txt, props.dict.availLangs, props.acceptLanguage, global.navigator)

    global.dev = props.dev
  }

  componentDidMount () {
    if (!isServer) {
      global.addEventListener('keydown', this.keyDown, false)
    }
  }

  componentWillUnmount () {
    if (!isServer) {
      global.removeEventListener('keydown', this.keyDown, false)
    }
  }

  keyDown (event) {
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      this.bar.focus()
    }
    // TODO if (focus not in input[type=text]|textarea)
    // console.log('document.activeElement', document.activeElement)
    if (true) {
      if (event.keyCode === 32 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // space
        event.preventDefault()
        this.togglePlaying()
      }
      if (event.keyCode === 39 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // right
        this.props.dispatch({
          type: 'Queue:next'
        })
      }
      if (event.keyCode === 37 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // left
        event.stopPropagation()
        this.props.dispatch({
          type: 'Queue:prev'
        })
      }
    }
  }

  play (data) {
    if (this.props.queue.now && this.props.queue.now.key) {
      this.props.dispatch({
        type: 'Queue:toHistory',
        data: this.props.queue.now
      })
    }
    // play track
    this.props.dispatch({
      type: 'Queue:play',
      data
    })
    this.props.dispatch({
      type: 'Player:setPlaying',
      playing: true
    })
  }

  togglePlaying (data) {
    if (this.props.queue.now) {
      const newPlaying = !this.props.player.playing
      this.props.dispatch({
        type: 'Player:setPlaying',
        playing: newPlaying
      })
    } else {
      this.props.dispatch({
        type: 'Queue:next'
      })
    }
  }

  playNext (data) {
    const newData = cloneDeep(data)
    // delete newData.Component
    newData.key = `${data.data.id.videoId}:${Date.now()}`
    this.props.dispatch({
      type: 'Queue:playNext',
      data: newData
    })
  }

  enqueue (data) {
    const newData = cloneDeep(data)
    newData.key = `${data.key || data.data.id.videoId}:${Date.now()}`
    this.props.dispatch({
      type: 'Queue:enqueue',
      data: newData
    })
  }

  dequeue (idx) {
    const newUpNext = cloneDeep(this.props.queue.upNext)
    pullAt(newUpNext, idx)
    this.props.dispatch({
      type: 'Queue:dequeue',
      newUpNext
    })
  }

  remember (data) {
    this.props.dispatch({
      type: 'Collection:toggle',
      data
    })
  }

  isInCollection (data) {
    return !!this.props.collection[data.data.id.videoId]
  }

  toggleShowPlayer (data) {
    this.props.dispatch({
      type: 'App:toggleShowPlayer'
    })
  }

  clearHistory (data) {
    this.props.dispatch({
      type: 'Queue:clearHistory'
    })
  }

  clearUpNext (data) {
    this.props.dispatch({
      type: 'Queue:clearUpNext'
    })
  }

  toggleShowHistory (data) {
    this.props.dispatch({
      type: 'App:toggleShowHistory'
    })
  }

  toggleShowUpNext (data) {
    this.props.dispatch({
      type: 'App:toggleShowUpNext'
    })
  }

  jumpTo (data, idx) {
    this.props.dispatch({
      type: 'Queue:jumpTo',
      data,
      idx
    })
    this.setPlaying(true)
  }

  setPlaying (playing) {
    this.props.dispatch({
      type: 'Player:setPlaying',
      playing
    })
  }

  jumpBackTo (data, idx) {
    const len = this.props.queue.history.length
    this.props.dispatch({
      type: 'Queue:jumpTo',
      data,
      idx: -(len - 1 - idx + 1)
    })
    this.setPlaying(true)
  }

  restartTrack () {
    if (this.props.party.attending) {
      this.props.dispatch({ type: 'Queue:restartTrack' })
    } else if (this.playerEl) {
      this.playerEl.seekTo(0)
    }
  }

  onTrackEnd () {
    if (this.props.queue.upNext.length > 0) {
      this.props.dispatch({
        type: 'Queue:next'
      })
    } else {
      this.props.dispatch({
        type: 'Player:setPlaying',
        value: false
      })
    }
  }

  render () {
    const history = this.props.party.attending
      ? this.props.party.state.queue.history
      : this.props.queue.history
    const now = this.props.party.attending
      ? this.props.party.state.queue.now
      : this.props.queue.now
    const upNext = this.props.party.attending
      ? this.props.party.state.queue.upNext
      : this.props.queue.upNext
    return (
      <div className='App'>
        <Bar
          dispatch={this.props.dispatch}
          placeholder={this.dict.get('bar.placeholder')}
          query={this.props.bar.query}
          items={this.props.bar.items}
          suggest={this.props.findMusic}
          ResultComponent={makeResultComponent({
            play: this.play,
            playNext: this.playNext,
            enqueue: this.enqueue,
            remember: this.remember,
            isInCollection: this.isInCollection
          })}
          onResult={{
            enter: this.play,
            'shift+enter': this.playNext,
            'ctrl+enter': this.enqueue
          }}
          commands={{
            clearHistory: this.clearHistory,
            clearUpNext: this.clearUpNext,
            toggleShowHistory: this.toggleShowHistory,
            toggleShowUpNext: this.toggleShowUpNext
          }}
          filters={{
            // TODO
            // Component:
            // history: this.props.queue.history,
            // upNext: this.props.queue.upNext,
            // artist: this.props.findArtist
            // track: this.props.findTracks
            // collection: this.props.collection
            // playlist: this.props.collection.playlists
            //
          }}
          // getComponent={(item, idx) => {
          //   switch (item.type) {
          //     case 'YouTubeVideo':
          //       return actionable(ResultComponent, [play(), dismiss()], [
          //         playNext(), enqueue(), remember(this.props.collection)
          //       ])
          //     case 'command':
          //       const Component = commandComponents[item.label]
          //       if (!Component) {
          //         throw new Error(`Unrecognized command ${item.label}`)
          //       }
          //       return Component
          //     default:
          //       throw new Error(`Unrecognized item type ${item.type}`)
          //   }
          // }}
          onRef={(ref) => {
            this.bar = ref
          }}
          autoFocus
        />
        <div className='main'>
          <h4>From env:</h4>
          <ul>
            <li>YouTube Search URL: {process.env.YOUTUBE_SEARCH_URL}</li>
            <li>WS Server URL: {process.env.WS_SERVER_URL}</li>
            <li>Internal IP: {process.env.INTERNAL_IP}</li>
          </ul>
          <Party
            className='autoparty'
            placeholder={this.dict.get('party.placeholder')}
            dict={this.dict}
            {...this.props.party}
            registerMiddleware={this.props.registerMiddleware}
            unregisterMiddleware={this.props.unregisterMiddleware}
            dispatch={this.props.dispatch}
            state={{
              player: this.props.player,
              queue: this.props.queue
            }}
            socket={this.props.socket}
          />
          <div className='queue'>
            <List
              title={this.dict.get('history.title')}
              className='history'
              items={history}
              defaultComponent={makeResultComponent({
                play: this.jumpBackTo,
                remember: this.remember,
                isInCollection: this.isInCollection
              })}
              onItem={{
                enter: this.jumpBackTo
              }}
              startsCollapsed
              collapsible
            />
            <section>
              { this.props.party.attending
                ? (
                  (this.props.app.showPlayer && this.props.party.state.queue.now.data)
                    ? (
                      <img
                        className='player-alt'
                        src={this.props.party.state.queue.now.data.snippet.thumbnails.high.url}
                        width={this.props.party.state.queue.now.data.snippet.thumbnails.high.width}
                        height={this.props.party.state.queue.now.data.snippet.thumbnails.high.height}
                        alt={`Thumnail for ${this.props.party.state.queue.now.data.title}`}
                      />
                    )
                    : null
                )
                : (
                  <Player
                    onRef={(playerEl) => {
                      this.playerEl = playerEl
                    }}
                    playingNow={this.props.queue.now}
                    playing={this.props.player.playing}
                    show={this.props.app.showPlayer}
                    dispatch={this.props.dispatch}
                    onEnded={this.onTrackEnd}
                  />
                )
              }
            </section>
            <List
              title={this.dict.get('upnext.title')}
              className='upNext'
              items={upNext}
              defaultComponent={makeResultComponent({
                play: this.jumpTo,
                remember: this.remember,
                dismiss: this.dequeue,
                isInCollection: this.isInCollection
              })}
              onItem={{
                enter: this.jumpTo
              }}
              collapsible
            />
          </div>
        </div>
        <Controls
          playingNow={now}
          PlayingNowComponent={makeResultComponent({
            play: this.togglePlaying,
            toggleShowPlayer: this.props.toggleShowPlayer,
            showPlayer: this.props.app.showPlayer,
            remember: this.remember,
            isInCollection: this.isInCollection
          })}
          f={this.props.party.attending ? this.props.party.state.player.f : this.props.player.f}
          t={this.props.party.attending ? this.props.party.state.t : this.props.player.t}
          restartTrack={this.restartTrack}
          playing={this.props.party.attending ? this.props.party.state.player.playing : this.props.player.playing}
          dispatch={this.props.dispatch}
          collection={this.props.collection}
          showPlayer={this.props.app.showPlayer}
        />
      </div>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'findMusic', type: PropTypes.func.isRequired },
  { name: 'app', type: PropTypes.object.isRequired },
  { name: 'bar', type: PropTypes.object.isRequired },
  { name: 'player', type: PropTypes.object.isRequired },
  { name: 'queue', type: PropTypes.object.isRequired },
  { name: 'party', type: PropTypes.object.isRequired }
]

App.defaultProps = defaultProps(props)
App.propTypes = propTypes(props)

export default App
