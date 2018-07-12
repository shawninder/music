import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import cloneDeep from 'lodash.clonedeep'
import pullAt from 'lodash.pullat'
import debounce from 'lodash.debounce'

import Bar from '../components/Bar'
import Player from '../components/Player'
import Controls from '../components/Controls'
import List from '../components/List'
import Party from '../components/Party'

import makeResultComponent from '../components/makeResultComponent'

import Dict from '../data/Dict.js'

const isServer = typeof window === 'undefined'

// TODO Find a way to import svgs
const playNowIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 2080.7722 2080.7722'
    style={{
      clipRule: 'evenodd',
      fillRule: 'evenodd',
      imageRendering: 'optimizeQuality',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision'
    }}
    version='1.1'
    title='play'
    alt='play'
    className='icon'
  >
    <g
      transform='translate(-3233.5713,-3531.2278)'
    >
      <path
        d='m 3612,5595 c -14,11 -32,17 -52,17 -49,0 -88,-39 -88,-88 v -1905 0 c 0,-16 4,-33 14,-48 26,-40 81,-52 122,-26 567.4233,315.5455 1395.2655,934.8411 1429.2366,959.0457 34.6354,24.6779 29.879,31.1801 37.3045,70.0595 7.9536,41.6444 -19.6035,85.8883 -57.4606,115.7788 C 4959.4747,4735.3673 4077.4111,5292.9447 3612,5595 Z'
      />
    </g>
  </svg>
)

// TODO Find a way to import svgs
const jumpToIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 2080.7722 2080.7722'
    style={{
      clipRule: 'evenodd',
      fillRule: 'evenodd',
      imageRendering: 'optimizeQuality',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision'
    }}
    version='1.1'
    title='jump to this track'
    alt='jump to this track'
    className='icon'
  >
    <g
      transform='translate(-3233.5713,-3531.2278)'
    >
      <path
        d='m 3612,5595 c -14,11 -32,17 -52,17 -49,0 -88,-39 -88,-88 v -1905 0 c 0,-16 4,-33 14,-48 26,-40 81,-52 122,-26 567.4233,315.5455 1395.2655,934.8411 1429.2366,959.0457 34.6354,24.6779 29.879,31.1801 37.3045,70.0595 7.9536,41.6444 -19.6035,85.8883 -57.4606,115.7788 C 4959.4747,4735.3673 4077.4111,5292.9447 3612,5595 Z'
      />
    </g>
  </svg>
)

// TODO Find a way to import svgs
const jumpBackToIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 2080.7722 2080.7722'
    style={{
      clipRule: 'evenodd',
      fillRule: 'evenodd',
      imageRendering: 'optimizeQuality',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision'
    }}
    version='1.1'
    title='jump back to this track'
    alt='jump back to this track'
    className='icon'
  >
    <g
      transform='translate(-3233.5713,-3531.2278)'
    >
      <path
        d='m 3612,5595 c -14,11 -32,17 -52,17 -49,0 -88,-39 -88,-88 v -1905 0 c 0,-16 4,-33 14,-48 26,-40 81,-52 122,-26 567.4233,315.5455 1395.2655,934.8411 1429.2366,959.0457 34.6354,24.6779 29.879,31.1801 37.3045,70.0595 7.9536,41.6444 -19.6035,85.8883 -57.4606,115.7788 C 4959.4747,4735.3673 4077.4111,5292.9447 3612,5595 Z'
      />
    </g>
  </svg>
)

// TODO Find a way to import svgs
const enqueueIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 2839.7594 2839.7594'
    style={{
      clipRule: 'evenodd',
      fillRule: 'evenodd',
      imageRendering: 'optimizeQuality',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision'
    }}
    version='1.1'
    title='enqueue'
    alt='enqueue'
    className='icon'
  >
    <g
      transform='translate(-3152.1203,-3152.1203)'
    >
      <path
        d='m 3239.8108,4659.6812 c -48.7903,0.7071 -88.3883,-38.8908 -87.6812,-87.6812 -0.7071,-48.7904 38.8909,-88.3883 87.6812,-87.6812 l 1243.8009,-0.7071 0.7071,-1243.8009 c -0.7071,-48.7903 38.8908,-88.3883 87.6812,-87.6812 48.7904,-0.7071 88.3883,38.8909 87.6812,87.6812 l 0.7071,1243.8009 1243.8009,0.7071 c 48.7903,-0.7071 88.3883,38.8908 87.6812,87.6812 0.7071,48.7904 -38.8909,88.3883 -87.6812,87.6812 l -1243.8009,0.7071 -0.7071,1243.8009 c 0.7071,48.7903 -38.8908,88.3883 -87.6812,87.6812 -48.7904,0.7071 -88.3883,-38.8909 -87.6812,-87.6812 l -0.7071,-1243.8009 z'
      />
    </g>
  </svg>
)

// TODO Find a way to import svgs
const nextIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 2199.9999 2199.9999'
    style={{
      clipRule: 'evenodd',
      fillRule: 'evenodd',
      imageRendering: 'optimizeQuality',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision'
    }}
    version='1.1'
    title='next'
    alt='next'
    className='icon'
  >
    <g
      transform='translate(-3472,-3471.5)'
    >
      <path
        d='m 5042,3531 h 542 c 49,0 88,39 88,88 v 1905 c 0,49 -39,88 -88,88 h -542 c -49,0 -88,-39 -88,-88 v -791 -322 -792 c 0,-49 39,-88 88,-88 z m -88,1202 -1342,862 c -14,11 -32,17 -52,17 -49,0 -88,-39 -88,-88 v -1905 0 c 0,-16 4,-33 14,-48 26,-40 81,-52 122,-26 l 1346,866 z'
      />
    </g>
  </svg>
)

// TODO Find a way to import svgs
const dequeueIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    version='1.1'
    style={{
      clipRule: 'evenodd',
      fillRule: 'evenodd',
      imageRendering: 'optimizeQuality',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision'
    }}
    viewBox='0 0 2060.5001 2060.5001'
    title='dequeue'
    alt='dequeue'
    className='icon'
  >
    <g
      transform='translate(-3541.75,-3541.75)'
    >
      <path
        d='m 3568,3692 c -35,-34 -35,-90 0,-124 34,-35 90,-35 124,0 l 880,879 880,-879 c 34,-35 90,-35 124,0 35,34 35,90 0,124 l -879,880 879,880 c 35,34 35,90 0,124 -34,35 -90,35 -124,0 l -880,-879 -880,879 c -34,35 -90,35 -124,0 -35,-34 -35,-90 0,-124 l 879,-880 z'
      />
    </g>
  </svg>
)

class App extends Component {
  static getInitialProps ({ req, res }) {
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    return { headers, acceptLanguage }
  }

  constructor (props) {
    super(props)
    this.dispatch = this.dispatch.bind(this)
    this.globalClick = this.globalClick.bind(this)
    this.keyDown = this.keyDown.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragUpdate = this.onDragUpdate.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.figureClicked = this.figureClicked.bind(this)
    this.figureKeyDown = this.figureKeyDown.bind(this)
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
    this.seekTo = this.seekTo.bind(this)

    this.loadMore = this.loadMore.bind(this)
    this.debouncedLoadMore = debounce(this.loadMore, 500, { maxWait: 750 }).bind(this) // TODO remove this debounce (possible when "loading" is implemented wherein a subsequent call would cancel, but only if calling with a different query or pageToken)

    this.bar = {}

    this.dict = new Dict(props.dict.txt, props.dict.availLangs, props.acceptLanguage, global.navigator)

    global.dev = props.dev
  }

  componentDidMount () {
    if (!isServer) {
      global.addEventListener('keydown', this.keyDown, false)
      global.addEventListener('click', this.globalClick, false)
    }
  }

  componentWillUnmount () {
    if (!isServer) {
      global.removeEventListener('keydown', this.keyDown, false)
      global.removeEventListener('click', this.globalClick, false)
    }
  }

  globalClick (event) {
    this.dispatch({ type: 'App:collapseParty' })
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
      this.dispatch({
        type: 'App:collapseParty'
      })
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
                this.dispatch({
                  type: 'Player:setPlaying',
                  playing: true
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
                this.dispatch({
                  type: 'Player:setPlaying',
                  playing: true
                })
                break
              case 'droppable-bar-list':
                const dragged = state.bar.items[source.index]
                this.dispatch({
                  type: 'Queue:play',
                  data: dragged
                })
                this.dispatch({
                  type: 'Player:setPlaying',
                  playing: true
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
    event.stopPropagation() // Avoid from letting the global click listeners from collapsing the party
    if (this.props.app.partyCollapsed) {
      this.dispatch({
        type: 'Bar:setItems',
        data: [],
        hasMore: false,
        nextPageToken: null,
        areCommands: true
      })
      this.dispatch({
        type: 'App:showParty'
      })
    } else {
      this.dispatch({
        type: 'App:collapseParty'
      })
    }
  }

  figureKeyDown (event) {
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      this.dispatch({
        type: 'App:collapseParty'
      })
    }
    if (event.keyCode === 32 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // space
      this.dispatch({
        type: 'App:toggleParty'
      })
    }
    if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
      this.dispatch({
        type: 'App:showParty'
      })
    }
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

    if (queueIndex > 0) {
      const newUpNext = cloneDeep(state.queue.upNext)
      pullAt(newUpNext, queueIndex - 1)
      this.dispatch({
        type: 'Queue:dequeue',
        newUpNext
      })
    } else if (queueIndex < 0) {
      const newHistory = cloneDeep(state.queue.history)
      pullAt(newHistory, newHistory.length + queueIndex)
      this.dispatch({
        type: 'Queue:dequeue',
        newHistory
      })
    } else if (queueIndex === 0) {
      // TODO
    }
    setTimeout(this.updateBarItems, 10)
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

  seekTo (value) {
    if (this.props.party.attending) {
      this.dispatch({
        type: 'Queue:seekTo',
        value
      })
    } else if (this.playerEl) {
      this.playerEl.seekTo(value)
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
    const id = decorated.data.id.videoId
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
      hasMore: this.props.bar.hasMore,
      nextPageToken: this.props.bar.nextPageToken,
      areCommands: false
    })
  }

  loadMore () {
    this.props.findMusic(this.props.bar.query, this.props.bar.nextPageToken).then(({ items, hasMore, prevPageToken, nextPageToken }) => {
      if (items.length > 0) {
        const newItems = items.map((item) => {
          const id = item.id.videoId
          const obj = {
            type: 'YouTubeVideo',
            key: id,
            data: item
          }
          return this.decorateBarItem(obj)
        })
        this.dispatch({
          type: 'Bar:setItems',
          data: this.props.bar.items.concat(newItems),
          hasMore,
          prevPageToken,
          nextPageToken,
          areCommands: false
        })
      }
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
    if (this.props.socket && this.props.socket.connected) {
      appClasses.push('connected')
    } else {
      appClasses.push('disconnected')
    }
    if (this.props.party.attending) {
      appClasses.push('attending')
    }
    if (this.props.party.hosting) {
      appClasses.push('hosting')
    }
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

    const historyClasses = ['history']
    const playingNowClasses = ['playingNow']
    const upNextClasses = ['upNext']
    return (
      <DragDropContext onDragStart={this.onDragStart} onDragUpdate={this.onDragUpdate} onDragEnd={this.onDragEnd}>
        <div className={appClasses.join(' ')}>
          <Bar
            dispatch={this.dispatch}
            placeholder={this.dict.get('bar.placeholder')}
            query={this.props.bar.query}
            items={this.props.bar.items}
            hasMore={this.props.bar.hasMore}
            loadMore={this.debouncedLoadMore}
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
                  icon: enqueueIcon,
                  cdn
                },
                playNext: {
                  targetIdx: 1,
                  go: this.playNext,
                  txt: 'play next',
                  icon: nextIcon,
                  cdn
                },
                play: {
                  targetIdx: 0,
                  go: this.play,
                  txt: 'play now',
                  icon: playNowIcon,
                  cdn
                },
                jumpBackTo: {
                  targetIdx: 0,
                  go: this.jumpBackTo,
                  txt: 'jump back to this track',
                  icon: jumpBackToIcon,
                  cdn: cdnNeg
                },
                jumpTo: {
                  targetIdx: 0,
                  go: this.jumpTo,
                  txt: 'jump to this track',
                  icon: jumpToIcon,
                  cdn: cdnPos
                },
                remove: {
                  targetIdx: null,
                  go: this.dequeue,
                  txt: 'remove',
                  icon: dequeueIcon,
                  cdn: cdnQueued
                }
              }
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
            onRef={(ref) => {
              this.bar = ref
            }}
            autoFocus
            decorateItem={this.decorateBarItem}
          />
          <div
            className={figureClasses.join(' ')}
            onClick={this.figureClicked}
            onKeyDown={this.figureKeyDown}
            tabIndex='0'
          >
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
              onFieldRef={(el) => {
                this.partyField = el
              }}
              onButtonRef={(el) => {
                this.partyButton = el
              }}
            />
            <div className='queue'>
              <List
                title={`${this.dict.get('history.title')} (${state.queue.history.length})`}
                className={historyClasses.join(' ')}
                items={state.queue.history}
                defaultComponent={makeResultComponent({
                  actions: {
                    jumpTo: {
                      targetIdx: 0,
                      go: this.jumpBackTo,
                      txt: 'jump back to this track',
                      icon: jumpBackToIcon
                    },
                    remove: {
                      targetIdx: null,
                      go: this.dequeue,
                      txt: 'remove',
                      icon: dequeueIcon
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
              <section className={playingNowClasses.join(' ')}>
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
                className={upNextClasses.join(' ')}
                items={state.queue.upNext}
                defaultComponent={makeResultComponent({
                  actions: {
                    jumpTo: {
                      targetIdx: 0,
                      go: this.jumpTo,
                      txt: 'jump to this track',
                      icon: jumpToIcon
                    },
                    remove: {
                      targetIdx: null,
                      go: this.dequeue,
                      txt: 'remove',
                      icon: dequeueIcon
                    }
                  }
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
            seekTo={this.seekTo}
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
