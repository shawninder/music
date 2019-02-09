import url from 'url'
import { EventEmitter } from 'events'
import qs from 'querystring'
import React, { Component } from 'react'

import PropTypes from 'prop-types'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import cloneDeep from 'lodash.clonedeep'
import pullAt from 'lodash.pullat'
import debounce from 'lodash.debounce'

import Head from './Head'
import Header from './Header'
import Bar from './Bar'
import Player from './Player'
import Controls from './Controls'
import List from './List'
import Party from './Party'
import Feedback from './Feedback'
import YouTube from './YouTube'
import Smart from './Smart'
import NoticeList from './NoticeList'
import Artwork from './Artwork'
import Figure from './Figure'
import FilesDialog from './FilesDialog'
import CancelDropZone from './CancelDropZone'

import Dict from '../data/Dict.js'
import getDragAndDropActions from '../features/dragAndDrop/getActions'

import playNowIcon from './icons/playNow'
import jumpToIcon from './icons/jumpTo'
import jumpBackToIcon from './icons/jumpBackTo'
import enqueueIcon from './icons/enqueue'
import nextIcon from './icons/next'
import dequeueIcon from './icons/dequeue'

import colors from '../styles/colors'
import alpha from '../helpers/alpha'
import tfns from '../styles/timing-functions'
import durations from '../styles/durations'
import lengths from '../styles/lengths'

import resetStyles from '../styles/reset'
import baseStyles from '../styles/base'

const isServer = typeof window === 'undefined'
const CHUNK_SIZE = 100000

const visibleFiles = {}

class App extends Component {
  static getInitialProps ({ req, res }) {
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    const linkedPartyName = req ? qs.parse(url.parse(req.url).query).name : undefined
    return { headers, acceptLanguage, linkedPartyName }
  }

  constructor (props) {
    super(props)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.dispatch = this.dispatch.bind(this)
    this.sendFile = this.sendFile.bind(this)
    this.gotFileChunk = this.gotFileChunk.bind(this)
    this.globalClick = this.globalClick.bind(this)
    this.keyDown = this.keyDown.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragUpdate = this.onDragUpdate.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.play = this.play.bind(this)
    this.togglePlaying = this.togglePlaying.bind(this)
    this.playNext = this.playNext.bind(this)
    this.enqueue = this.enqueue.bind(this)
    this.dequeue = this.dequeue.bind(this)
    // this.remember = this.remember.bind(this)
    // this.isInCollection = this.isInCollection.bind(this)
    this.clearHistory = this.clearHistory.bind(this)
    this.clearPlayingNow = this.clearPlayingNow.bind(this)
    this.clearUpNext = this.clearUpNext.bind(this)
    this.clearAll = this.clearAll.bind(this)
    this.toggleShowHistory = this.toggleShowHistory.bind(this)
    this.toggleShowUpNext = this.toggleShowUpNext.bind(this)
    this.toggleShowFiles = this.toggleShowFiles.bind(this)
    this.jumpTo = this.jumpTo.bind(this)
    this.jumpBackTo = this.jumpBackTo.bind(this)
    this.restartTrack = this.restartTrack.bind(this)
    this.onTrackEnd = this.onTrackEnd.bind(this)
    this.getPartyState = this.getPartyState.bind(this)
    this.decorateItem = this.decorateItem.bind(this)
    this.gotState = this.gotState.bind(this)
    this.gotSlice = this.gotSlice.bind(this)
    this.gotDispatch = this.gotDispatch.bind(this)
    this.updateTracks = this.updateTracks.bind(this)
    this.inspectPartyServer = this.inspectPartyServer.bind(this)
    this.files = this.file.bind(this)
    this.seekTo = this.seekTo.bind(this)
    this.setVolume = this.setVolume.bind(this)
    this.setPlayerVolume = this.setPlayerVolume.bind(this)
    this.getTrackEvents = this.getTrackEvents.bind(this)
    this.makeOrigin = this.makeOrigin.bind(this)
    this.getComponentProps = this.getComponentProps.bind(this)

    this.loadMore = this.loadMore.bind(this)
    this.debouncedLoadMore = debounce(this.loadMore, 500, { maxWait: 750 }).bind(this) // TODO remove this debounce (possible when "loading" is implemented wherein a subsequent call would cancel, but only if calling with a different query or pageToken)

    this.bar = {}
    this.db = null

    this.dict = new Dict(props.dict.txt, props.dict.availLangs, props.acceptLanguage, global.navigator)

    global.dev = props.dev
  }

  componentDidMount () {
    if (!isServer) {
      global.addEventListener('keydown', this.keyDown, false)
      global.addEventListener('click', this.globalClick, false)

      const w = window || {}
      const indexedDB = w.indexedDB || w.webkitIndexedDB || w.mozIndexedDB || w.OIndexedDB || w.msIndexedDB
      if (indexedDB) {
        const dbVersion = 1
        const request = indexedDB.open('guestFiles', dbVersion)
        const createObjectStore = (dataBase) => {
          // Create an objectStore
          console.log('Creating objectStore')
          dataBase.createObjectStore('guestFiles')
        }

        request.onerror = (event) => {
          console.log('Error creating/accessing IndexedDB database')
        }

        request.onsuccess = (event) => {
          console.log('Created/accessed IndexedDB database')
          this.db = request.result

          this.db.onerror = function (event) {
            console.log('Error creating/accessing IndexedDB database')
          }

          // Interim solution for Google Chrome to create an objectStore. Will be deprecated
          if (this.db.setVersion) {
            if (this.db.version !== dbVersion) {
              const setVersion = this.db.setVersion(dbVersion)
              setVersion.onsuccess = function () {
                createObjectStore(this.db)
              }
            }
          }
        }

        // For future use. Currently only in latest Firefox versions
        request.onupgradeneeded = (event) => {
          createObjectStore(event.target.result)
        }
      }
    }
  }

  componentWillUnmount () {
    if (!isServer) {
      global.removeEventListener('keydown', this.keyDown, false)
      global.removeEventListener('click', this.globalClick, false)

      console.log('Closing IndexedDB')
      if (this.db) {
        this.db.close()
      }
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

  file (data) {
    window.document.querySelector('.controls-newFile').click()
  }

  dispatch (action) {
    if (action.type === 'Queue:restartTrack' && !this.props.party.attending) {
      this.restartTrack()
    } else {
      this.props.dispatch(action)
    }
  }

  makeOrigin () {
    return this.props.party.attending ? Math.random().toString().slice(2) : undefined
  }

  gotDispatch (action) {
    this.props.dispatch(action)
    if (action.type === 'Player:setVolume') {
      this.setPlayerVolume(action.value)
    }
    if (action.origin) {
      this.props.dispatch({
        type: 'Ack:ack',
        origin: action.origin
      })
    }
    setTimeout(this.updateTracks, 10)
  }

  gotFileChunk (msg) {
    const key = msg.key
    const transaction = this.db.transaction(['guestFiles'], 'readwrite')
    transaction.oncomplete = (event) => {
      console.log('====transaction completed')
    }
    transaction.oncomplete = (event) => {
      console.log('====transaction completed')
    }
    transaction.onerror = (event) => {
      console.error('transaction.error', transaction.error)
    }
    const objectStore = transaction.objectStore('guestFiles')
    const get = objectStore.get(key)
    get.onsuccess = (event) => {
      const chunk = msg.arrayBuffer
      let newLength = chunk.byteLength
      if (get.result) {
        const concatenated = new window.Blob([get.result, chunk], { type: 'audio' })
        newLength = concatenated.size
        const put = objectStore.put(concatenated, key)
        put.onsuccess = function (event) {
          console.log('====PUT SUCCESS')
        }
        put.onerror = (event) => {
          console.log('====PUT ERROR', event, put.result)
        }
      } else {
        const chunkBlob = new window.Blob([chunk], { type: 'audio' })
        newLength = chunkBlob.size
        const add = objectStore.add(chunkBlob, key)
        add.onsuccess = (event) => {
          console.log('====ADD SUCCESS')
        }
        add.onerror = (event) => {
          console.error('====ADD ERROR', event, get.result)
        }
      }
      if (msg.fileSize > newLength) {
        this.props.socket.emit('requestChunk', { fileKey: key, start: newLength, guestKey: msg.guestKey })
      } else {
        this.props.socket.emit('gotFile', { fileKey: key, guestKey: msg.guestKey })
      }
    }
    get.onerror = (event) => {
      console.log('====GET ERROR', event, get.result)
    }
  }

  setPlayerVolume (value) {
    if (this.playerEl) {
      const internal = this.playerEl.getInternalPlayer()
      if (internal.setVolume) {
        internal.setVolume(value * 100)
      }
    }
  }

  gotState (state) {
    this.props.dispatch({
      type: 'Party:gotState',
      state
    })
    setTimeout(this.updateTracks, 10)
  }

  gotSlice (slice) {
    this.props.dispatch({
      type: 'Party:gotSlice',
      slice
    })
    setTimeout(this.updateTracks, 10)
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
    //     type: 'Queue:prev',
    //     origin: this.makeOrigin()
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
        const origin = this.makeOrigin()
        getDragAndDropActions({ source, destination, origin, state, props: this.props }).map(this.dispatch)
      }
    }
  }

  sendFile (action) {
    const handler = new EventEmitter()
    let canceled = false
    handler.cancel = () => {
      canceled = true
      this.props.socket.emit('cancelSendFile', {
        ...action,
        name: this.props.party.name,
        socketKey: this.props.party.socketKey
      })
    }
    const key = action.key
    const file = visibleFiles[key]
    const fileSize = file.size
    const fileReader = new window.FileReader()
    const firstSlice = file.slice(0, Math.min(CHUNK_SIZE, fileSize), 'audio')
    fileReader.readAsArrayBuffer(firstSlice)
    const fn = ({ fileKey, start }) => {
      if (fileKey === key) {
        handler.emit('progress', start / fileSize)
        if (!canceled) {
          const chunkSize = Math.min(CHUNK_SIZE, fileSize - start)
          const slice = file.slice(start, start + chunkSize, 'audio')
          const reader = new window.FileReader()
          reader.readAsArrayBuffer(slice)
          reader.onload = (event) => {
            const arrayBuffer = reader.result
            this.props.socket.emit('file-transfer-chunk', {
              ...action,
              fileSize,
              arrayBuffer,
              name: this.props.party.name,
              socketKey: this.props.party.socketKey
            })
          }
        }
      }
    }
    this.props.socket.on('requestChunk', fn)
    const done = ({ fileKey }) => {
      if (key === fileKey) {
        handler.emit('success')
        this.props.socket.off('gotFile', done)
        this.props.socket.off('requestChunk', done)
      }
    }
    this.props.socket.on('gotFile', done)
    fileReader.onload = (event) => {
      const arrayBuffer = fileReader.result
      this.props.socket.emit('file-transfer-chunk', {
        ...action,
        fileSize,
        arrayBuffer,
        name: this.props.party.name,
        socketKey: this.props.party.socketKey
      })
    }
    return handler
  }

  play (data) {
    const state = this.getPartyState()
    const origin = this.makeOrigin()
    if (state.queue.now.key) {
      this.dispatch({
        type: 'Queue:toHistory',
        data: state.queue.now,
        origin
      })
    }
    // play track
    this.dispatch({
      type: 'Queue:play',
      data,
      origin
    })
    this.dispatch({
      type: 'Player:setPlaying',
      playing: true
    })
    setTimeout(this.updateTracks, 10)
  }

  togglePlaying () {
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
    const newData = cloneDeep(data)
    this.dispatch({
      type: 'Queue:playNext',
      data: newData,
      origin: this.makeOrigin()
    })
    setTimeout(this.updateTracks, 10)
  }

  enqueue (data) {
    const newData = cloneDeep(data)
    newData.key = data.key
    const origin = this.makeOrigin()
    if (this.props.party.attending) {
      this.dispatch({
        type: 'Ack:addPending',
        dispatching: 'Queue:enqueue',
        data: newData,
        origin
      })
      const confirm = (obj) => {
        if (obj.ack && obj.ack.origin === origin) {
          this.props.socket.off('slice', confirm)
          this.dispatch({
            type: 'Ack:removePending',
            dispatching: 'Queue:enqueue',
            data: newData,
            origin
          })
        }
      }
      this.props.socket.on('slice', confirm)
    }
    this.dispatch({
      type: 'Queue:enqueue',
      data: newData,
      origin
    })
    setTimeout(this.updateTracks, 10)
  }

  dequeue (data, idx, queueIndex, event) {
    const state = this.getPartyState()
    const origin = this.makeOrigin()

    if (queueIndex > 0) {
      const newUpNext = cloneDeep(state.queue.upNext)
      pullAt(newUpNext, queueIndex - 1)
      this.dispatch({
        type: 'Queue:dequeue',
        newUpNext,
        origin
      })
    } else if (queueIndex < 0) {
      const newHistory = cloneDeep(state.queue.history)
      pullAt(newHistory, newHistory.length + queueIndex)
      this.dispatch({
        type: 'Queue:dequeue',
        newHistory,
        origin
      })
    } else if (queueIndex === 0) {
      // TODO
    }
    setTimeout(this.updateTracks, 10)
  }

  // remember (data) {
  //   this.dispatch({
  //     type: 'Collection:toggle',
  //     data
  //   })
  // }

  // isInCollection (data) {
  //   return !!this.props.collection[data.key]
  // }

  clearHistory (data) {
    this.dispatch({
      type: 'Queue:clearHistory'
    })
  }

  clearPlayingNow (data) {
    this.dispatch({
      type: 'Queue:clearPlayingNow'
    })
  }

  clearUpNext (data) {
    this.dispatch({
      type: 'Queue:clearUpNext'
    })
  }

  clearAll (data) {
    this.dispatch({
      type: 'Queue:clearAll'
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

  toggleShowFiles (data) {
    this.dispatch({
      type: 'App:toggleShowFiles'
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

  setVolume (value) {
    this.dispatch({
      type: 'Player:setVolume',
      value
    })
    if (!this.props.party.attending && this.playerEl) {
      this.setPlayerVolume(value)
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
        playing: false
      })
    }
  }

  decorateItem (item) {
    const state = this.getPartyState()
    const decorated = cloneDeep(item)
    let queueIndex = null
    const history = state.queue.history
    if (history.length > 0) {
      history.forEach((track) => {
        if (track.key === decorated.key) {
          queueIndex = track.queueIndex
        }
      })
    }
    const upNext = state.queue.upNext
    if (upNext.length > 0) {
      upNext.forEach((track) => {
        if (track.key === decorated.key) {
          queueIndex = track.queueIndex
        }
      })
    }
    const now = state.queue.now
    if (now.key === decorated.key) {
      queueIndex = now.queueIndex
    }
    item.queueIndex = queueIndex
    const inQueue = (item.queueIndex !== null)
    decorated.inQueue = inQueue
    decorated.queueIndex = queueIndex
    return decorated
  }

  updateTracks () {
    const data = this.props.bar.items.map(this.decorateItem)
    this.props.dispatch({
      type: 'Bar:setItems',
      data,
      hasMore: this.props.bar.hasMore,
      nextPageToken: this.props.bar.nextPageToken,
      areCommands: false
    })
    const files = this.props.fileInput.files.map(this.decorateItem)
    this.props.dispatch({
      type: 'FileInput:setItems',
      files
    })
  }

  loadMore () {
    this.props.findMusic(this.props.bar.query, this.props.bar.nextPageToken).then(({ items, hasMore, prevPageToken, nextPageToken }) => {
      if (items.length > 0) {
        const newItems = items.map(this.decorateItem)
        // TODO dedupe or warn youtube and find another key for the items
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

  getTrackEvents () {
    const state = this.getPartyState()
    return {
      'space': (...args) => {
        if (state.queue.now.key && state.player.playing) {
          this.enqueue(...args)
        } else {
          this.play(...args)
        }
      },
      'ctrl+enter': this.enqueue,
      'shift+enter': this.playNext,
      'ctrl+shift+enter': this.play
    }
  }

  getComponentProps (state) {
    return {
      pending: this.props.ack.pending,
      playingNow: state.queue.now.key,
      isPlaying: state.player.playing
    }
  }

  render () {
    const state = this.getPartyState()
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
      return queueIndex === 0 || !!queueIndex
    }
    const appClasses = ['App']

    if (this.props.socket) {
      if (this.props.socket.connected) {
        appClasses.push('connected')
      } else {
        appClasses.push('disconnected')
      }
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

    let playingNowZone
    if (state.queue.now.key) {
      playingNowZone = (
        <React.Fragment>
          <Smart
            key='Playing-Now'
            data={{
              ...state.queue.now,
              inQueue: true,
              queueIndex: 0
            }}
            onClick={this.togglePlaying}
            pending={this.props.ack.pending}
            playingNow={state.queue.now.key}
            isPlaying={state.player.playing}
            idx={0}
            queueIndex={0}
          />
          <div className='overlay' onClick={(event) => {
            this.dispatch({
              type: 'App:cyclePlayerMode'
            })
          }} />
        </React.Fragment>
      )
    } else {
      playingNowZone = (
        <Droppable droppableId={`droppable-playingNow`}>
          {(droppableProvided, snapshot) => {
            return (
              <ol ref={droppableProvided.innerRef} key='playingNow-droppable'>
                <li className='emptyDropZone' key='playingNow-emptyDropZone'>
                  <img
                    className='emptyImage'
                    src='/static/ogImage.png'
                    alt={this.dict.get('header.tagline')}
                    title={this.dict.get('queue.playingNow.emptyZone')}
                  />
                </li>
                {droppableProvided.placeholder}
              </ol>
            )
          }}
        </Droppable>
      )
    }

    const historyClasses = ['history']
    const playingNowClasses = ['playingNow']
    playingNowClasses.push(this.props.app.playerMode)
    const upNextClasses = ['upNext']

    const defaultActions = {
      enqueue: {
        targetIdx: state.queue.upNext.length + 1,
        go: this.enqueue,
        txt: this.dict.get('actions.enqueue'),
        icon: enqueueIcon,
        cdn
      },
      playNext: {
        targetIdx: 1,
        go: this.playNext,
        txt: this.dict.get('actions.playNext'),
        icon: nextIcon,
        cdn
      },
      play: {
        targetIdx: 0,
        go: this.play,
        txt: this.dict.get('actions.playNow'),
        icon: playNowIcon,
        cdn
      },
      jumpBackTo: {
        targetIdx: 0,
        go: this.jumpBackTo,
        txt: this.dict.get('actions.jumpBackTo'),
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
        txt: this.dict.get('actions.remove'),
        icon: dequeueIcon,
        cdn: cdnQueued
      }
    }

    let playerWidth
    let playerHeight
    if (this.props.app.playerMode === 'mini') {
      playerWidth = '88px'
      playerHeight = '60px'
    } else if (this.props.app.playerMode === 'medium') {
      playerWidth = '640px'
      playerHeight = '360px'
    }
    return (
      <React.Fragment>
        <DragDropContext onDragStart={this.onDragStart} onDragUpdate={this.onDragUpdate} onDragEnd={this.onDragEnd}>
          <Head title="Crowd's Play" />
          <div className={appClasses.join(' ')}>
            <Bar
              dispatch={this.dispatch}
              placeholder={this.dict.get('bar.placeholder')}
              query={this.props.bar.query}
              items={this.props.bar.items}
              hasMore={this.props.bar.hasMore}
              loadMore={this.debouncedLoadMore}
              areCommands={this.props.bar.areCommands}
              go={(query) => {
                return this.props.findMusic(query)
                  .then((results) => {
                    if (results.items.length > 0) {
                      const newItems = results.items.map(this.decorateItem)
                      results.items = newItems
                    }
                    return results
                  })
              }}
              componentProps={{
                ...this.getComponentProps(state),
                actions: defaultActions
              }}
              ResultComponent={YouTube}
              onResult={this.getTrackEvents()}
              commands={{
                clearHistory: this.clearHistory,
                clearPlayingNow: this.clearPlayingNow,
                clearUpNext: this.clearUpNext,
                clearAll: this.clearAll,
                toggleShowHistory: this.toggleShowHistory,
                toggleShowUpNext: this.toggleShowUpNext,
                inspectPartyServer: this.inspectPartyServer,
                file: this.file
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
              decorateItem={this.decorateItem}
              loadingTxt={this.dict.get('bar.loading')}
              maxReachedTxt={this.dict.get('bar.maxReached')}
            />
            <CancelDropZone />
            <Figure
              socket={this.props.socket}
              partyState={state}
              dispatch={this.dispatch}
            />
            <main>
              <Header
                dict={this.dict}
                notify={this.props.notify}
              />
              <Party
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
                linkedPartyName={this.props.linkedPartyName}
                gotState={this.gotState}
                gotSlice={this.gotSlice}
                gotDispatch={this.gotDispatch}
                collapsed={this.props.app.partyCollapsed}
                onFieldRef={(el) => {
                  this.partyField = el
                }}
                pending={this.props.ack.pending}
                notify={this.props.notify}
                gotFileChunk={this.gotFileChunk}
                autoFocus
              />
              <List
                showLabel={`${this.dict.get('queue.history.show')} (${state.queue.history.length})`}
                hideLabel={`${this.dict.get('queue.history.hide')} (${state.queue.history.length})`}
                className={historyClasses.join(' ')}
                items={state.queue.history}
                componentProps={{
                  ...this.getComponentProps(state),
                  actions: {
                    jumpTo: {
                      targetIdx: 0,
                      go: this.jumpBackTo,
                      txt: this.dict.get('actions.jumpBackTo'),
                      icon: jumpBackToIcon
                    },
                    remove: {
                      targetIdx: null,
                      go: this.dequeue,
                      txt: this.dict.get('actions.remove'),
                      icon: dequeueIcon
                    }
                  }
                }}
                defaultComponent={Smart}
                onItem={{
                  space: this.jumpBackTo
                }}
                startsCollapsed
                collapsible
                areDraggable
                hidden={state.queue.history.length === 0}
              />
              <div className={playingNowClasses.join(' ')} key='playingNow'>
                {playingNowZone}
                {(state.queue.now.key && !this.props.party.attending)
                  ? (
                    <Player
                      onRef={(playerEl) => {
                        this.playerEl = playerEl
                      }}
                      playingNow={state.queue.now}
                      playing={state.player.playing}
                      dispatch={this.dispatch}
                      onEnded={this.onTrackEnd}
                      width={playerWidth}
                      height={playerHeight}
                      controls
                    />
                  ) : null}
                {(state.queue.now.key && this.props.party.attending)
                  ? (
                    <Artwork
                      playingNow={state.queue.now}
                      isPlaying={state.player.playing}
                      dispatch={this.dispatch}
                      className='Artwork'
                    />
                  ) : null}
              </div>
              <List
                className={upNextClasses.join(' ')}
                items={state.queue.upNext}
                componentProps={{
                  ...this.getComponentProps(state),
                  actions: {
                    jumpTo: {
                      targetIdx: 0,
                      go: this.jumpTo,
                      txt: this.dict.get('actions.jumpTo'),
                      icon: jumpToIcon
                    },
                    remove: {
                      targetIdx: null,
                      go: this.dequeue,
                      txt: this.dict.get('actions.remove'),
                      icon: dequeueIcon
                    }
                  }
                }}
                defaultComponent={Smart}
                areDraggable
                emptyComponent={<li key='upNext-emptyDropZone'><div className='emptyDropZone'>{this.dict.get('queue.upNext.emptyZone')}</div></li>}
              />
              <Feedback
                dispatch={this.dispatch}
                notify={this.props.notify}
                dict={this.dict}
              />
            </main>
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
              setVolume={this.setVolume}
              volume={this.props.party.attending ? this.props.party.state.player.v : this.props.player.v}
              nbFiles={this.props.fileInput.files.length}
              toggleShowFiles={() => {
                this.toggleShowFiles()
              }}
              newFileInput={() => {
                // if (this.props.party.attending) {
                //   this.props.notify({
                //     id: Math.random().toString().slice(2),
                //     body: 'Still working on this feature, stay tuned!',
                //     duration: 5000
                //   })
                // } else {
                this.dispatch({
                  type: 'FileInput:new',
                  idx: this.props.fileInput.files.length > 0 ? this.props.fileInput.files.length - 1 : 0
                })
                if (!this.props.app.showFiles) {
                  this.toggleShowFiles()
                }
                // }
              }}
              showingFiles={this.props.app.showFiles}
            />
            <FilesDialog
              items={this.props.fileInput.files}
              state={state}
              dispatch={this.dispatch}
              actions={defaultActions}
              attending={this.props.party.attending}
              notify={this.props.notify}
              getComponentProps={this.getComponentProps}
              showFiles={this.props.app.showFiles}
              getTrackEvents={this.getTrackEvents}
              visibleFiles={visibleFiles}
            />
          </div>
        </DragDropContext>
        <NoticeList
          key='notice-list'
          showing={this.props.notice.showing.length > 0}
          notices={this.props.notice.showing}
        />
        <style jsx global>{`
          ${resetStyles}

          ${baseStyles}

          .emptyImage {
            width: 100%;
          }

          .controls-buttons button svg {
            width: 20px;
          }

          .App {
            transition-timing-function: ${tfns.easeInOutQuad};
          }

          .App {
            padding: 0;
            position: relative;
            background-color: ${colors.primaryBg};
            background-image: url("/static/bg.svg");
            background-repeat: no-repeat;
            background-position: left top;
            background-size: 100% 100%;
            transition-property: background-color;
            transition-duration: ${durations.moment};
            overflow: scroll;
          }

          .App.connected, .App.connected .figure {
            background-color: ${colors.primary};
          }

          .App.hosting  {
            background-color: ${colors.hostingBg};
          }

          .App.disconnected, .App.disconnected .figure {
            background-color: ${colors.textBg};
          }

          .App.dragging .cancelDropZone {
            opacity: 1;
            z-index: 3;
          }

          .bar-dismiss svg {
            width: 15px;
          }

          .App .bar-list {
            max-width: 640px;
            max-height: 100vh;
            overflow-y: scroll;
            position: fixed;
            top: ${lengths.rowHeight};
            left: 0;
            z-index: 2;
          }

          .App .bar-list {
            background: ${colors.text};
          }

          .App .bar-list.list > ol > li:nth-child(odd) {
            background: ${colors.textBgOdd};
          }

          .App .bar-list.list > ol > li:nth-child(even) {
            background: ${colors.textBgEven};
          }

          .App.dragging .bar-list {
            box-shadow: 0px 12px 15px 0px rgb(0,0,0,0.0);
            background: rgba(50, 50, 50, 0);
          }

          .App.dragging .bar-list li {
            opacity: 0.05;
          }

          .App.dragging .bar-list li.dragging {
            opacity: 1.01;
          }

          main {
            position: relative;
            width: 100%;
            min-width: 250px;
            overflow: scroll;
          }

          @media screen and (min-width: 640px) {
            main {
              max-width: 640px;
              margin: auto auto;
            }
          }

          .Artwork {
            width: ${playerWidth};
            height: ${playerHeight};
            position: relative;
            z-index: 0;
          }

          .playingNow {
            position: relative;
            &.mini {
              margin-bottom: 0;
              .Player {
                top: 0;
                left: 5px;
              }
              .Artwork {
                top: -62px;
                left: 5px;
              }
            }
            &.medium {
              margin-bottom: 360px;
              .Player {
                top: 64px;
                left: 0;
              }
              .Artwork {
                top: 0;
                left: 0;
              }
            }
            .overlay {
              width: 88px;
              height: 60px;
              position: absolute;
              top: 2px;
              left: 5px;
              cursor: pointer;
              z-index: 1;
            }
          }

          .hidden {
            opacity: 0;
          }

          .bar-list .toggle .idx {
            color: ${colors.text2};
          }
          .bar-list .track .toggle .art {
            transition-duration: ${durations.instant};
            transition-timing-function: ${tfns.easeInOutQuad};
          }

          .bar-list .track .toggle .art-img {
            transition-duration: ${durations.instant};
            transition-timing-function: ${tfns.easeInOutQuad};
          }

          .track .icon {
            width: 15px;
          }

          li:nth-child(odd) .actions {
            background-color: ${colors.textBgOdd};
          }

          li:nth-child(even) .actions {
            background-color: ${colors.textBgEven};
          }

          .history>h3 {
            cursor: pointer;
            font-size: medium;
            padding: 10px;
            transition-property: opacity, height;
            transition-duration: ${durations.moment};
            opacity: 1;
          }

          .history {
            opacity: 1;
            transition-property: opacity;
            transition-duration: ${durations.moment};
          }

          .App.dragging .history>h3, .App.dragging .playingNow>h3, .App.dragging .upNext>h3 {
            opacity: 1;
          }

          .collapsed>ol {
            opacity: 0;
            position: absolute;
          }

          .upNext, .history, .playingNow {
            text-align: left;
            margin: 0 auto;
            width: 100%;
            max-width: 640px;
          }
          .history, .upNext {
            background: ${alpha(colors.textBg, colors.opacity)};
          }
          .playingNow {
            background: ${alpha(colors.text, 1 - colors.opacity)};
            color: ${colors.textBg};
            .art {
              .idx {
                width: 0;
              }
              .art-img {
                width: 88px;
                height: 60px;
                border-radius: 0;
              }
            }
          }

          .emptyDropZone {
            line-height: 60px;
            text-align: center;
          }

          .upNext ol, .history ol, .playingNow ol {
            min-height: 1px; /* Necessary for inserting into empty lists */
            transition-property: background-color;
            transition-duration: ${durations.moment};
          }

          .App.dragging .history ol, .App.dragging .upNext ol {
            background: ${alpha(colors.textBg, colors.opacity)};
          }

          .App.dragging .playingNow ol {
            background: ${alpha(colors.text, 1 - colors.opacity)};
          }

          .App.disconnected.attending .controls button, .App.disconnected.attending .controls input, .App.disconnected.attending .controls label {
            color: ${colors.text2};
          }

          .App.disconnected .seek-bar--current {
            background-color: ${colors.dangerousText};
          }

          .history, .history .icon, .upNext, .upNext .icon {
            color: ${colors.text};
          }

          .playingNow .icon {
            color: ${colors.textBg};
          }

          .App.attending .copyButton, .App.hosting .copyButton {
            opacity: 1;
          }
        `}</style>
      </React.Fragment>
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
  { name: 'notice', type: PropTypes.object.isRequired },
  { name: 'socketKey', type: PropTypes.string.isRequired },
  { name: 'notify', type: PropTypes.func, val: console.log }
]

App.defaultProps = defaultProps(props)
App.propTypes = propTypes(props)

export default App
