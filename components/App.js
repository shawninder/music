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
    this.dispatch = this.dispatch.bind(this)
    this.keyDown = this.keyDown.bind(this)
    this.play = this.play.bind(this)
    this.togglePlaying = this.togglePlaying.bind(this)
    this.playNext = this.playNext.bind(this)
    this.enqueue = this.enqueue.bind(this)
    this.dequeue = this.dequeue.bind(this)
    // this.remember = this.remember.bind(this)
    // this.isInCollection = this.isInCollection.bind(this)
    this.toggleShowPlayer = this.toggleShowPlayer.bind(this)
    this.clearHistory = this.clearHistory.bind(this)
    this.clearUpNext = this.clearUpNext.bind(this)
    this.toggleShowHistory = this.toggleShowHistory.bind(this)
    this.toggleShowUpNext = this.toggleShowUpNext.bind(this)
    this.jumpTo = this.jumpTo.bind(this)
    this.jumpBackTo = this.jumpBackTo.bind(this)
    this.restartTrack = this.restartTrack.bind(this)
    this.onTrackEnd = this.onTrackEnd.bind(this)
    this.getPartyState = this.getPartyState.bind(this)

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

  getPartyState () {
    return this.props.party.attending
      ? this.props.party.state
      : this.props
  }

  dispatch (action) {
    if (action.type === 'Queue:restartTrack' && !this.props.party.attending) {
      this.restartTrack()
    } else {
      this.props.dispatch(action)
    }
  }

  keyDown (event) {
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      this.bar.focus()
    }
    // TODO if (focus not in input[type=text]|textarea)
    if (true) {
      if (event.keyCode === 32 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // space
        event.preventDefault()
        this.togglePlaying()
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

  play (data) {
    const state = this.getPartyState()
    if (state.queue.now && state.queue.now.key) {
      this.dispatch({
        type: 'Queue:toHistory',
        data: state.queue.now
      })
    }
    // play track
    this.dispatch({
      type: 'Queue:play',
      data
    })
    this.dispatch({
      type: 'Player:setPlaying',
      playing: true
    })
  }

  togglePlaying (data) {
    const state = this.getPartyState()
    if (state.queue.now) {
      const newPlaying = !state.player.playing
      this.dispatch({
        type: 'Player:setPlaying',
        playing: newPlaying
      })
    } else {
      this.dispatch({
        type: 'Queue:next'
      })
    }
  }

  playNext (data) {
    const newData = cloneDeep(data)
    // delete newData.Component
    newData.key = `${data.data.id.videoId}:${Date.now()}`
    this.dispatch({
      type: 'Queue:playNext',
      data: newData
    })
  }

  enqueue (data) {
    const newData = cloneDeep(data)
    newData.key = `${data.key || data.data.id.videoId}:${Date.now()}`
    this.dispatch({
      type: 'Queue:enqueue',
      data: newData
    })
  }

  dequeue (data, idx) {
    console.log('DEQUEUE', idx)
    const state = this.getPartyState()
    const newUpNext = cloneDeep(state.queue.upNext)
    console.log('BEFORE', newUpNext, idx)
    pullAt(newUpNext, idx)
    console.log('AFTER', newUpNext, idx)
    this.dispatch({
      type: 'Queue:dequeue',
      newUpNext
    })
  }

  // remember (data) {
  //   this.dispatch({
  //     type: 'Collection:toggle',
  //     data
  //   })
  // }

  // isInCollection (data) {
  //   return !!this.props.collection[data.data.id.videoId]
  // }

  toggleShowPlayer (data) {
    this.dispatch({
      type: 'App:toggleShowPlayer'
    })
  }

  clearHistory (data) {
    this.dispatch({
      type: 'Queue:clearHistory'
    })
  }

  clearUpNext (data) {
    this.dispatch({
      type: 'Queue:clearUpNext'
    })
  }

  toggleShowHistory (data) {
    this.dispatch({
      type: 'App:toggleShowHistory'
    })
  }

  toggleShowUpNext (data) {
    this.dispatch({
      type: 'App:toggleShowUpNext'
    })
  }

  jumpTo (data, idx) {
    this.dispatch({
      type: 'Queue:jumpTo',
      data,
      idx
    })
    this.setPlaying(true)
  }

  setPlaying (playing) {
    this.dispatch({
      type: 'Player:setPlaying',
      playing
    })
  }

  jumpBackTo (data, idx) {
    const state = this.getPartyState()
    const len = state.queue.history.length
    this.dispatch({
      type: 'Queue:jumpTo',
      data,
      idx: -(len - 1 - idx + 1)
    })
    this.setPlaying(true)
  }

  restartTrack () {
    if (this.props.party.attending) {
      this.dispatch({ type: 'Queue:restartTrack' })
    } else if (this.playerEl) {
      this.playerEl.seekTo(0)
    }
  }

  onTrackEnd () {
    const state = this.getPartyState()
    const len = state.queue.upNext.length
    if (len > 0) {
      this.dispatch({
        type: 'Queue:next'
      })
    } else {
      this.dispatch({
        type: 'Player:setPlaying',
        value: false
      })
    }
  }

  render () {
    const state = this.getPartyState()
    return (
      <div className='App'>
        <Bar
          dispatch={this.dispatch}
          placeholder={this.dict.get('bar.placeholder')}
          query={this.props.bar.query}
          items={this.props.bar.items}
          suggest={this.props.findMusic}
          ResultComponent={makeResultComponent({
            actions: {
              play: {
                go: this.play,
                txt: 'play now',
                icon: <img className='action-icon' src='/static/play.svg' title='play now' alt='play now' />
              },
              playNext: {
                go: this.playNext,
                txt: 'play next',
                icon: <img className='action-icon' src='/static/next.svg' title='play next' alt='play next' />
              },
              enqueue: {
                go: this.enqueue,
                txt: 'play last',
                icon: <img className='action-icon' src='/static/plus.svg' title='play last' alt='play last' />
              }
            },
            onClick: this.enqueue

            // remember: this.remember,
            // isInCollection: this.isInCollection
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
          <Party
            className='autoparty'
            placeholder={this.dict.get('party.placeholder')}
            dict={this.dict}
            registerMiddleware={this.props.registerMiddleware}
            unregisterMiddleware={this.props.unregisterMiddleware}
            dispatch={this.dispatch}
            state={{
              player: this.props.player,
              queue: this.props.queue
            }}
            socket={this.props.socket}
            {...this.props.party} // state
          />
          <div className='queue'>
            <List
              title={this.dict.get('history.title')}
              className='history'
              items={state.queue.history}
              defaultComponent={makeResultComponent({
                actions: {
                  jumpTo: {
                    go: this.jumpBackTo,
                    txt: 'jump back to',
                    icon: <img className='action-icon' src='/static/play.svg' title='jump back to' alt='jump back to' />
                  },
                  playNow: {
                    go: this.playNow,
                    txt: 'play now',
                    icon: <img className='action-icon' src='/static/play.svg' title='play now' alt='play now' />
                  },
                  playNext: {
                    go: this.playNext,
                    txt: 'play next',
                    icon: <img className='action-icon' src='/static/next.svg' title='play next' alt='play next' />
                  },
                  playLast: {
                    go: this.enqueue,
                    txt: 'play last',
                    icon: <img className='action-icon' src='/static/plus.svg' title='play last' alt='play last' />
                  }
                },
                onClick: this.jumpBackTo
                // remember: this.remember,
                // isInCollection: this.isInCollection
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
                  (this.props.app.showPlayer && state.queue.now.data)
                    ? (
                      <img
                        className='player-alt'
                        src={state.queue.now.data.snippet.thumbnails.high.url}
                        width={state.queue.now.data.snippet.thumbnails.high.width}
                        height={state.queue.now.data.snippet.thumbnails.high.height}
                        alt={`Thumnail for ${state.queue.now.data.title}`}
                      />
                    )
                    : null
                )
                : (
                  <Player
                    onRef={(playerEl) => {
                      this.playerEl = playerEl
                    }}
                    playingNow={state.queue.now}
                    playing={state.player.playing}
                    show={state.app.showPlayer}
                    dispatch={this.dispatch}
                    onEnded={this.onTrackEnd}
                  />
                )
              }
            </section>
            <List
              title={this.dict.get('upnext.title')}
              className='upNext'
              items={state.queue.upNext}
              defaultComponent={makeResultComponent({
                actions: {
                  jumpTo: {
                    go: this.jumpTo,
                    txt: 'jump to',
                    icon: <img className='action-icon' src='/static/play.svg' title='jump to' alt='jump to' />
                  },
                  playNow: {
                    go: this.play,
                    txt: 'play now',
                    icon: <img className='action-icon' src='/static/play.svg' title='play now' alt='play now' />
                  },
                  playNext: {
                    go: this.playNext,
                    txt: 'play next',
                    icon: <img className='action-icon' src='/static/next.svg' title='play next' alt='play next' />
                  },
                  playLast: {
                    go: this.enqueue,
                    txt: 'play last',
                    icon: <img className='action-icon' src='/static/plus.svg' title='play last' alt='play last' />
                  },
                  remove: {
                    go: this.dequeue,
                    txt: 'remove',
                    icon: <img className='action-icon' src='/static/x.svg' title='remove' alt='remove' />
                  }
                },
                onClick: this.jumpTo
                // remember: this.remember,

                // isInCollection: this.isInCollection
              })}
              onItem={{
                enter: this.jumpTo
              }}
              collapsible
            />
          </div>
        </div>
        <Controls
          playingNow={state.queue.now}
          PlayingNowComponent={makeResultComponent({
            actions: {
              toggleShowPlayer: {
                go: this.props.toggleShowPlayer,
                txt: this.props.app.showingPlayer ? 'hide player' : 'show player',
                icon: <img className='action-icon' src='/static/camera.svg' title='toggle player' alt='toggle player' />
              }
            },
            onClick: this.togglePlaying
            // play: {
            //   go: this.togglePlaying,
            //   txt: 'play/pause',
            //   icon: <img src='/static/pause.svg' title='pause' alt='pause' />
            // },
            // toggleShowPlayer: this.props.toggleShowPlayer,
            // showPlayer: this.props.app.showPlayer
            // remember: this.remember,
            // isInCollection: this.isInCollection
          })}
          f={state.player.f}
          t={state.player.t}
          history={state.queue.history}
          upNext={state.queue.upNext}
          restartTrack={this.restartTrack}
          playing={state.player.playing}
          dispatch={this.dispatch}
          collection={this.props.collection}
          showPlayer={this.props.app.showPlayer}
          toggleShowHistory={this.toggleShowHistory}
          toggleShowUpNext={this.toggleShowUpNext}
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
