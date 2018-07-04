import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
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
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragUpdate = this.onDragUpdate.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.figureClicked = this.figureClicked.bind(this)
    this.play = this.play.bind(this)
    this.togglePlaying = this.togglePlaying.bind(this)
    this.playNext = this.playNext.bind(this)
    this.enqueue = this.enqueue.bind(this)
    this.dequeue = this.dequeue.bind(this)
    // this.remember = this.remember.bind(this)
    // this.isInCollection = this.isInCollection.bind(this)
    this.clearHistory = this.clearHistory.bind(this)
    this.clearUpNext = this.clearUpNext.bind(this)
    this.toggleShowHistory = this.toggleShowHistory.bind(this)
    this.toggleShowUpNext = this.toggleShowUpNext.bind(this)
    this.jumpTo = this.jumpTo.bind(this)
    this.jumpBackTo = this.jumpBackTo.bind(this)
    this.restartTrack = this.restartTrack.bind(this)
    this.onTrackEnd = this.onTrackEnd.bind(this)
    this.getPartyState = this.getPartyState.bind(this)
    this.decorateBarItem = this.decorateBarItem.bind(this)
    this.gotState = this.gotState.bind(this)
    this.gotSlice = this.gotSlice.bind(this)
    this.gotDispatch = this.gotDispatch.bind(this)
    this.updateBarItems = this.updateBarItems.bind(this)
    this.inspectPartyServer = this.inspectPartyServer.bind(this)

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

  // inspectParty (data) {
  //   if (this.props.socket.connected) {
  //     this.props.socket.once('partyDetails')
  //     this.props.socket.emit('get')
  //   } else {
  //     console.log("Can't inspect party, socket disconnected")
  //   }
  // }

  inspectPartyServer (data) {
    if (this.props.socket.connected) {
      this.props.socket.once('gotDetails', (details) => {
        console.log('details', details)
      })
      console.log('emitting getDetails')
      this.props.socket.emit('getDetails')
    } else {
      console.log("Can't inspect party server, socket disconnected")
    }
  }

  dispatch (action) {
    if (action.type === 'Queue:restartTrack' && !this.props.party.attending) {
      this.restartTrack()
    } else {
      this.props.dispatch(action)
    }
  }

  gotDispatch (action) {
    this.props.dispatch(action)
    setTimeout(this.updateBarItems, 10)
  }

  gotState (state) {
    this.props.dispatch({
      type: 'Party:gotState',
      state
    })
    setTimeout(this.updateBarItems, 10)
  }

  gotSlice (slice) {
    this.props.dispatch({
      type: 'Party:gotSlice',
      slice
    })
    setTimeout(this.updateBarItems, 10)
  }

  keyDown (event) {
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      this.bar.focus()
    }
    if (event.keyCode === 32 && !event.metaKey && event.ctrlKey && !event.shiftKey) { // ctrl+space
      event.preventDefault()
      this.togglePlaying()
    }
    // TODO ctrl+right and ctrl+left don't work, find something else
    // if (event.keyCode === 39 && !event.metaKey && event.ctrlKey && !event.shiftKey) { // ctrl+right
    //   console.log('ctrl+right')
    //   this.dispatch({
    //     type: 'Queue:next'
    //   })
    // }
    // if (event.keyCode === 37 && !event.metaKey && event.ctrlKey && !event.shiftKey) { // ctrl+left
    //   event.stopPropagation()
    //   this.dispatch({
    //     type: 'Queue:prev'
    //   })
    // }
  }

  onDragStart (data, { announce }) {
    // TODO Use `announce` to deliver an aural message to screen readers
    this.dispatch({
      type: 'App:dragging',
      value: true,
      data
    })
  }

  onDragUpdate (data, { announce }) {
    // TODO Use `announce` to deliver an aural message to screen readers
  }

  onDragEnd ({ type, reason, destination, source }, { announce }) {
    // TODO Use `announce` to deliver an aural message to screen readers
    this.dispatch({
      type: 'App:dragging',
      value: false
    })
    if (type === 'DEFAULT' && reason === 'DROP') {
      if (destination) { // else item was returned to initial position or such
        const state = this.getPartyState()
        switch (destination.droppableId) {
          case 'droppable-upNext':
            switch (source.droppableId) {
              case 'droppable-upNext':
                this.dispatch({
                  type: 'Queue:move',
                  from: {
                    name: 'upNext',
                    idx: source.index
                  },
                  to: {
                    name: 'upNext',
                    idx: destination.index
                  }
                })
                break
              case 'droppable-history':
                this.dispatch({
                  type: 'Queue:move',
                  from: {
                    name: 'history',
                    idx: source.index
                  },
                  to: {
                    name: 'upNext',
                    idx: destination.index
                  }
                })
                break
              case 'droppable-bar-list':
                this.dispatch({
                  type: 'Queue:insert',
                  data: this.props.bar.items[source.index],
                  at: {
                    name: 'upNext',
                    idx: destination.index
                  }
                })
                break
              default:
                console.log(`Unhandled drag source ${source.droppableId} dropped on Up Next`)
                break
            }
            break
          case 'droppable-history':
            switch (source.droppableId) {
              case 'droppable-upNext':
                this.dispatch({
                  type: 'Queue:move',
                  from: {
                    name: 'upNext',
                    idx: source.index
                  },
                  to: {
                    name: 'history',
                    idx: destination.index
                  }
                })
                break
              case 'droppable-history':
                this.dispatch({
                  type: 'Queue:move',
                  from: {
                    name: 'history',
                    idx: source.index
                  },
                  to: {
                    name: 'history',
                    idx: destination.index
                  }
                })
                break
              case 'droppable-bar-list':
                this.dispatch({
                  type: 'Queue:insert',
                  data: this.props.bar.items[source.index],
                  at: {
                    name: 'history',
                    idx: destination.index
                  }
                })
                break
              default:
                console.log(`Unhandled drag source ${source.droppableId} dropped on History`)
                break
            }
            break
          case 'droppable-playingNow':
            switch (source.droppableId) {
              case 'droppable-history': {
                const hist = cloneDeep(state.queue.history)
                const item = cloneDeep(hist[source.index])
                pullAt(hist, source.index)
                this.dispatch({
                  type: 'Queue:dequeue',
                  newHistory: hist
                })
                this.dispatch({
                  type: 'Queue:play',
                  data: item
                })
                break
              }
              case 'droppable-upNext':
                const un = cloneDeep(state.queue.upNext)
                const item = cloneDeep(un[source.index])
                pullAt(un, source.index)
                this.dispatch({
                  type: 'Queue:dequeue',
                  newUpNext: un
                })
                this.dispatch({
                  type: 'Queue:play',
                  data: item
                })
                break
              case 'droppable-bar-list':
                const dragged = state.bar.items[source.index]
                console.log('dragged.key', dragged.key)
                this.dispatch({
                  type: 'Queue:play',
                  data: dragged
                })
                break
              default:
                console.log(`Unhandled drag source ${source.droppableId} dropped on Playing Now`)
                break
            }
            break
          default:
            console.log(`Unhandled drop zone ${destination.droppableId}`)
            break
        }
      }
    }
  }

  figureClicked (event) {
    this.dispatch({
      type: 'App:toggleParty'
    })
  }

  play (data) {
    const state = this.getPartyState()
    if (state.queue.now.key) {
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
    setTimeout(this.updateBarItems, 10)
  }

  togglePlaying (data) {
    const state = this.getPartyState()
    if (state.queue.now.key) {
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
    const state = this.getPartyState()
    if (!state.queue.now.key) {
      this.play(data)
    } else {
      const newData = cloneDeep(data)
      // delete newData.Component
      newData.key = `${data.data.id.videoId}:${Date.now()}`
      this.dispatch({
        type: 'Queue:playNext',
        data: newData
      })
      setTimeout(this.updateBarItems, 10)
    }
  }

  enqueue (data) {
    const state = this.getPartyState()
    if (!state.queue.now.key) {
      this.play(data)
    } else {
      const newData = cloneDeep(data)
      newData.key = `${data.key || data.data.id.videoId}:${Date.now()}`
      this.dispatch({
        type: 'Queue:enqueue',
        data: newData
      })
      setTimeout(this.updateBarItems, 10)
    }
  }

  dequeue (data, idx, queueIndex, event) {
    const state = this.getPartyState()
    const newUpNext = cloneDeep(state.queue.upNext)
    if (queueIndex > 0) {
      pullAt(newUpNext, queueIndex - 1)
      this.dispatch({
        type: 'Queue:dequeue',
        newUpNext
      })
      setTimeout(this.updateBarItems, 10)
    } else {
      // TODO
    }
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

  decorateBarItem (item) {
    const state = this.getPartyState()
    const decorated = cloneDeep(item)
    const id = decorated.key
    let queueIndex = null
    const history = state.queue.history
    if (history.length > 0) {
      history.forEach((track) => {
        if (track.data.id.videoId === id) {
          queueIndex = track.queueIndex
        }
      })
    }
    const upNext = state.queue.upNext
    if (upNext.length > 0) {
      upNext.forEach((track) => {
        if (track.data.id.videoId === id) {
          queueIndex = track.queueIndex
        }
      })
    }
    const now = state.queue.now
    if (now.data && now.data.id.videoId === id) {
      queueIndex = now.queueIndex
    }
    item.queueIndex = queueIndex
    const inQueue = (item.queueIndex !== null)
    decorated.inQueue = inQueue
    decorated.queueIndex = queueIndex
    return decorated
  }

  updateBarItems () {
    const data = this.props.bar.items.map(this.decorateBarItem)
    this.props.dispatch({
      type: 'Bar:setItems',
      data,
      areCommands: false
    })
  }

  render () {
    const state = this.getPartyState()
    const figureClasses = ['figure']
    figureClasses.push(this.props.socket.connected ? 'connected' : 'disconnected')
    if (this.props.party.hosting) {
      figureClasses.push('hosting')
    }
    if (this.props.party.attending) {
      figureClasses.push('attending')
    }
    const cdn = (queueIndex) => {
      return !queueIndex
    }
    const cdnNeg = (queueIndex) => {
      return queueIndex < 0
    }
    const cdnPos = (queueIndex) => {
      return queueIndex > 0
    }
    const cdnQueued = (queueIndex) => {
      return !!queueIndex
    }
    const appClasses = ['App']
    if (this.props.app.dragging) {
      appClasses.push('dragging')
    }

    const PlayingNowC = makeResultComponent()

    const playingNowZone = state.queue.now.key
      ? (
        <PlayingNowC data={{
          data: state.queue.now.data,
          inQueue: true,
          queueIndex: 0
        }} />
      )
      : (
        <Droppable droppableId={`droppable-playingNow`}>
          {(droppableProvided, snapshot) => {
            return (
              <ol ref={droppableProvided.innerRef} />
            )
          }}
        </Droppable>
      )
    return (
      <DragDropContext onDragStart={this.onDragStart} onDragUpdate={this.onDragUpdate} onDragEnd={this.onDragEnd}>
        <div className={appClasses.join(' ')}>
          <Bar
            dispatch={this.dispatch}
            placeholder={this.dict.get('bar.placeholder')}
            query={this.props.bar.query}
            items={this.props.bar.items}
            areCommands={this.props.bar.areCommands}
            suggest={(query) => {
              return this.props.findMusic(query)
            }}
            ResultComponent={makeResultComponent({
              actions: {
                enqueue: {
                  targetIdx: state.queue.upNext.length + 1,
                  go: this.enqueue,
                  txt: 'play last',
                  icon: <img src='/static/plus.svg' title='play last' alt='play last' />,
                  cdn
                },
                playNext: {
                  targetIdx: 1,
                  go: this.playNext,
                  txt: 'play next',
                  icon: <img src='/static/next.svg' title='play next' alt='play next' />,
                  cdn
                },
                play: {
                  targetIdx: 0,
                  go: this.play,
                  txt: 'play now',
                  icon: <img src='/static/play.svg' title='play now' alt='play now' />,
                  cdn
                },
                jumpBackTo: {
                  targetIdx: 0,
                  go: this.jumpBackTo,
                  txt: 'jump back to this track',
                  icon: <img src='/static/play.svg' title='jump back to' alt='jump back to' />,
                  cdn: cdnNeg
                },
                jumpTo: {
                  targetIdx: 0,
                  go: this.jumpTo,
                  txt: 'jump to this track',
                  icon: <img src='/static/play.svg' title='jump to' alt='jump to' />,
                  cdn: cdnPos
                },
                remove: {
                  targetIdx: null,
                  go: this.dequeue,
                  txt: 'remove',
                  icon: <img src='/static/x.svg' title='remove' alt='remove' />,
                  cdn: cdnQueued
                }
              }

              // remember: this.remember,
              // isInCollection: this.isInCollection
            })}
            onResult={{
              'space': this.enqueue,
              'ctrl+enter': this.enqueue,
              'shift+enter': this.playNext,
              'ctrl+shift+enter': this.play
            }}
            commands={{
              clearHistory: this.clearHistory,
              clearUpNext: this.clearUpNext,
              toggleShowHistory: this.toggleShowHistory,
              toggleShowUpNext: this.toggleShowUpNext,
              // inspectParty: this.inspectParty,
              inspectPartyServer: this.inspectPartyServer
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
            decorateItem={this.decorateBarItem}
          />
          <div className={figureClasses.join(' ')} onClick={this.figureClicked}>
            {/* <img src='/static/party-hosting.svg' alt='hosting' title='hosting' /> */}
          </div>
          <div className='main'>
            <Party
              className={`autoparty ${this.props.app.partyCollapsed ? 'collapsed' : 'not-collapsed'}`}
              placeholder={this.dict.get('party.placeholder')}
              dict={this.dict}
              registerMiddleware={this.props.registerMiddleware}
              unregisterMiddleware={this.props.unregisterMiddleware}
              dispatch={this.dispatch}
              player={this.props.player}
              queue={this.props.queue}
              socketKey={this.props.socketKey}
              socket={this.props.socket}
              {...this.props.party} // state
              gotState={this.gotState}
              gotSlice={this.gotSlice}
              gotDispatch={this.gotDispatch}
              collapsed={this.props.app.partyCollapsed}
              onClickCollapsed={() => {
                this.dispatch({
                  type: 'App:toggleParty'
                })
              }}
            />
            <div className='queue'>
              <List
                title={`${this.dict.get('history.title')} (${state.queue.history.length})`}
                className='history'
                items={state.queue.history}
                defaultComponent={makeResultComponent({
                  actions: {
                    jumpTo: {
                      targetIdx: 0,
                      go: this.jumpBackTo,
                      txt: 'jump back to this track',
                      icon: <img src='/static/play.svg' title='jump back to' alt='jump back to' />
                    }
                  }
                  // remember: this.remember,
                  // isInCollection: this.isInCollection
                })}
                onItem={{
                  space: this.jumpBackTo
                }}
                startsCollapsed
                collapsible
                areDraggable
              />
              <section className='playingNow'>
                <h3>
                  {this.dict.get('queue.playingNow.title')}
                </h3>
                {playingNowZone}
                {state.queue.now.key && !this.props.party.attending
                  ? (
                    <Player
                      onRef={(playerEl) => {
                        this.playerEl = playerEl
                      }}
                      playingNow={state.queue.now}
                      playing={state.player.playing}
                      dispatch={this.dispatch}
                      onEnded={this.onTrackEnd}
                    />
                  )
                  : null
                }
              </section>
              <List
                title={`${this.dict.get('upnext.title')} (${state.queue.upNext.length})`}
                className='upNext'
                items={state.queue.upNext}
                defaultComponent={makeResultComponent({
                  actions: {
                    jumpTo: {
                      targetIdx: 0,
                      go: this.jumpTo,
                      txt: 'jump to this track',
                      icon: <img src='/static/play.svg' title='jump to' alt='jump to' />
                    },
                    remove: {
                      targetIdx: null,
                      go: this.dequeue,
                      txt: 'remove',
                      icon: <img src='/static/x.svg' title='remove' alt='remove' />
                    }
                    // more: {
                    //   targetIdx: null,
                    //   go: () => {
                    //     console.log('MORE', 'coming soon')
                    //   },
                    //   txt: 'more options',
                    //   icon: <img src='/static/dots.svg' title='more options' alt='more options' />
                    // }
                  }
                  // remember: this.remember,

                  // isInCollection: this.isInCollection
                })}
                onItem={{
                }}
                collapsible
                areDraggable
              />
            </div>
          </div>
          <Controls
            f={state.player.f}
            t={state.player.t}
            history={state.queue.history}
            upNext={state.queue.upNext}
            restartTrack={this.restartTrack}
            playing={state.player.playing}
            dispatch={this.dispatch}
            collection={this.props.collection}
            toggleShowHistory={this.toggleShowHistory}
            toggleShowUpNext={this.toggleShowUpNext}
          />
        </div>
      </DragDropContext>
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
  { name: 'party', type: PropTypes.object.isRequired },
  { name: 'socketKey', type: PropTypes.number.isRequired }
]

App.defaultProps = defaultProps(props)
App.propTypes = propTypes(props)

export default App
