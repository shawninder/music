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
import Bar from './Bar'
import Player from './Player'
import Controls from './Controls'
import List from './List'
import Party from './Party'
import Feedback from './Feedback'
import YouTube from './YouTube'
import AudioFileInput from './AudioFileInput'
import Smart from './Smart'
import NoticeList from './NoticeList'
import Artwork from './Artwork'

import Dict from '../data/Dict.js'
import getFileMeta from '../features/fileInput/getFileMeta'
import getDragAndDropActions from '../features/dragAndDrop/getActions'

import playNowIcon from './icons/playNow'
import jumpToIcon from './icons/jumpTo'
import jumpBackToIcon from './icons/jumpBackTo'
import enqueueIcon from './icons/enqueue'
import nextIcon from './icons/next'
import dequeueIcon from './icons/dequeue'

import colors from '../styles/colors'
import tfns from '../styles/timing-functions'

const isServer = typeof window === 'undefined'
const CHUNK_SIZE = 100000
const visibleFiles = {}

function fileToKey (file) {
  return encodeURIComponent(`${file.size}_${file.lastModified}_${file.name}`)
}

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
    this.onFiles = this.onFiles.bind(this)
    this.getTrackEvents = this.getTrackEvents.bind(this)
    this.makeOrigin = this.makeOrigin.bind(this)

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

  onFiles (event) {
    const target = event.target
    const files = target.files
    const nbFiles = files.length
    let i = 0
    while (i < nbFiles) {
      const file = files[i]
      const key = fileToKey(file)
      visibleFiles[key] = file
      const filePath = window.URL.createObjectURL(file)
      this.props.dispatch({
        type: 'FileInput:newFile',
        file: file,
        key,
        filePath
      })
      if (this.props.party.attending) {
        const id = `sending:${key}`
        const handler = this.sendFile({
          key,
          arrayBuffer: []
        })
        handler.on('progress', (progress) => {
          this.props.notify({
            id,
            progress
          })
        })
        handler.on('success', () => {
          console.log('====B success')
          this.props.notify({
            id,
            body: this.dict.get('files.sending.success'),
            progress: 1,
            buttons: {
              no: {
                label: this.dict.get('files.sending.undo'),
                cb: () => {
                  console.log('====File sent successfully')
                }
              }
            }
          })
        })
        handler.on('error', (err) => {
          console.log('====C error', err)
          this.props.notify({
            id,
            body: this.dict.get('files.sending.error'),
            err,
            buttons: {
              no: null
            }
          })
        })
        console.log('====D sending')
        this.props.notify({
          id,
          body: this.dict.get('files.sending'),
          progress: 0,
          buttons: {
            ok: {
              label: this.dict.get('files.sending.ok'),
              cb: () => {
                this.dispatch({
                  type: 'Notice:remove',
                  id
                })
              }
            },
            no: {
              label: this.dict.get('files.sending.cancel'),
              cb: () => {
                handler.cancel()
                console.log('====E TODO: Tell receiver to clean up partial download')
                // TODO: Tell receiver to clean up partial download?
              }
            }
          }
        })
      }
      let meta
      getFileMeta(file)
        .then((_meta) => {
          meta = _meta
          this.props.dispatch({
            type: 'FileInput:meta',
            meta,
            target,
            key
          })
        })
        .catch((error) => {
          console.error("Can't get metadata", error)
        })
      i += 1
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
      return queueIndex === 0 || !!queueIndex
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

    let playingNowZone
    if (state.queue.now.key) {
      playingNowZone = (
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
      )
    } else {
      playingNowZone = (
        <Droppable droppableId={`droppable-playingNow`}>
          {(droppableProvided, snapshot) => {
            return (
              <ol ref={droppableProvided.innerRef} key='playingNow-droppable'>
                <li className='emptyDropZone' key='playingNow-emptyDropZone'>{this.dict.get('queue.playingNow.emptyZone')}</li>
                {droppableProvided.placeholder}
              </ol>
            )
          }}
        </Droppable>
      )
    }

    const historyClasses = ['history']
    const playingNowClasses = ['playingNow']
    const upNextClasses = ['upNext']

    let partyName = this.props.name
    if (!this.props.name && this.props.name !== '' && this.props.linkedPartyName) {
      partyName = this.props.linkedPartyName
    }

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

    const fileInputProps = {
      ...this.getComponentProps(state),
      actionsAbove: true,
      onFiles: this.onFiles,
      onCancel: (event) => {
        this.dispatch({
          type: 'FileInput:cancelNew'
        })
      },
      actions: defaultActions
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
              suggest={(query) => {
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
              autoFocus
              decorateItem={this.decorateItem}
              loadingTxt={this.dict.get('bar.loading')}
              maxReachedTxt={this.dict.get('bar.maxReached')}
            />
            <div className='cancelDropZone'>
              Drop here to cancel
            </div>
            <div
              className={figureClasses.join(' ')}
              onClick={this.figureClicked}
              onKeyDown={this.figureKeyDown}
              tabIndex='0'
            />
            <div className='main'>
              <Party
                className={'autoparty'}
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
                onButtonRef={(el) => {
                  this.partyButton = el
                }}
                pending={this.props.ack.pending}
                notify={this.props.notify}
                gotFileChunk={this.gotFileChunk}
              />
              <h3 className='partyName'>{partyName}</h3>
              <div className='queue'>
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
                <section className={playingNowClasses.join(' ')}>
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
                      />
                    ) : (
                      <Artwork
                        playingNow={state.queue.now}
                        isPlaying={state.player.playing}
                        dispatch={this.dispatch}
                      />
                    )}
                </section>
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
                  collapsible
                  areDraggable
                  empty={<li key='upNext-emptyDropZone'><div className='emptyDropZone'>{this.dict.get('queue.upNext.emptyZone')}</div></li>}
                />
              </div>
              <Feedback
                dispatch={this.dispatch}
                notify={this.props.notify}
                dict={this.dict}
              />
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
          </div>
          <div className={`filesDialog ${this.props.app.showFiles ? 'showing' : 'hidden'}`}>
            <div className='card'>
              <List
                className='files'
                items={this.props.fileInput.files}
                onItem={this.getTrackEvents()}
                defaultComponent={AudioFileInput}
                isDropDisabled
                areDraggable
                componentProps={fileInputProps}
              />
            </div>
          </div>
        </DragDropContext>
        <NoticeList
          key='notice-list'
          showing={this.props.notice.showing.length > 0}
          notices={this.props.notice.showing}
        />
        <style jsx>{`
          .filesDialog {
            position: fixed;
            bottom: 65px;
            left: 0;
            width: 100%;
            max-width: 640px;
            border-radius: 4px;
            color: whitesmoke;
            background: #333333;
            z-index: 2;
            transition-property: opacity;
            transition-duration: 0.1s;
            opacity: 0;
          }

          .filesDialog.showing {
            opacity: 1;
          }
          .filesDialog .card {
            width: 100%;
          }
        `}</style>
        <style jsx global>{`
          html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:'';content:none}table{border-collapse:collapse;border-spacing:0}

          * {
            box-sizing: border-box;
          }

          html, body, #__next, .App {
            height: 100%;
            width: 100%;
          }

          #__next-error {
            position: fixed;
            z-index: 1000;
          }

          body {
            /* Approximate system fonts
              -apple-system, BlinkMacSystemFont, // Safari Mac/iOS, Chrome
              "Segoe UI", Roboto, Oxygen, // Windows, Android, KDE
              Ubuntu, Cantarell, "Fira Sans", // Ubuntu, Gnome, Firefox OS
              "Droid Sans", "Helvetica Neue", sans-serif; // Old Android
            */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            background-color: ${colors.black};
          }

          input[type=text].disabled {
            background: ${colors.beige};
          }

          svg {
            fill: currentColor; /* For SVGs, see https://css-tricks.com/cascading-svg-fill-color/ */
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
            background-color: ${colors.black};
            background-image: url('static/bg.svg');
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-size: 100% 100% !important;
            transition-property: background-color;
            transition-duration: 1s;
            overflow: scroll;
          }

          .App.connected, .App.connected .figure, .App.connected .autoparty {
            background-color: ${colors.aqua};
          }

          .App.attending, .App.attending .figure, .App.attending .autoparty {
            background-color: ${colors.green};
          }

          .App.hosting, .App.hosting .figure, .App.hosting .autoparty {
            background-color: ${colors.orange};
          }

          .App.disconnected, .App.disconnected .figure, .App.disconnected .autoparty {
            background-color: ${colors.six};
          }

          .authForm {
            float: right;
          }

          .authForm label {
            margin-left: 10px;
          }

          .bar {
            position: relative;
            z-index: 3;
            height: 50px;
            width: 100%;
          }

          .bar-menu {
            color: ${colors.dimgrey};
            position: fixed;
            top: 5px;
            left: 5px;
            z-index: 5;
            padding: 10px;
            height: 50px;
          }

          .bar-menu:focus {
            color: ${colors.whitesmoke};
          }

          .bar-menu .icon {
            width: 20px;
          }

          .bar-field {
            position: fixed;
            top: 0;
            height: 50px;
            width: 100%;
            font-size: large;
            font-weight: bold;
            padding: 5px 80px 5px 60px;
            z-index: 4;
            border: 0;
            color: ${colors.whitesmoke};
            background: ${colors.black};
            border-radius: 0;
            box-shadow: 0px 5px 5px 0px rgb(0,0,0,0.25);
            transition-property: background-color;
            transition-duration: 0.5s;
          }

          .cancelDropZone {
            position: fixed;
            top: 0;
            height: 50px;
            width: 100%;
            font-size: large;
            font-weight: bold;
            padding: 5px 80px 5px 60px;
            z-index: 1;
            border: 0;
            color: ${colors.whitesmoke};
            background: rgba(254, 70, 70, 0.8);
            border-radius: 0;
            transition-property: background-color;
            transition-duration: 0.5s;
            line-height: 2em;
            text-align: center;
            opacity: 0;
          }

          .App.dragging .cancelDropZone {
            opacity: 1;
            z-index: 3;
          }

          .App.dragging .bar-field {
            /* background: bisque; */
          }

          .bar-field::placeholder {
            color: ${colors.lightgrey};
          }

          .bar-dismiss {
            position: fixed;
            top: 5px;
            right: 50px;
            font-size: large;
            z-index: 4;
            padding: 13px 13px;
            color: ${colors.whitesmoke};
          }

          .bar-dismiss svg {
            width: 15px;
          }

          .App .bar-list {
            max-width: 640px;
            max-height: 100vh;
            overflow-y: scroll;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 2;
          }

          .logsPage {
            max-width: 100vw;
          }

          .bar-list {
            display: grid;
            grid-template-rows: 50px 1fr;
            grid-template-areas:
              "nothing"
              "results";
            box-shadow: 0px 12px 15px 0px rgb(0,0,0,0.25);
            transition-property: opacity, box-shadow;
            transition-duration: 0.5s;
            color: black;
          }

          .App .bar-list {
            background: ${colors.black};
          }

          .bar-list .loader {
            text-align: center;
            cursor: text;
          }

          .bar-list > ol {
            max-height: 100vh;
            overflow: auto;
          }

          .App .bar-list.list > ol > li:nth-child(odd) {
            background: ${colors.whitesmoke};
          }

          .App .bar-list.list > ol > li:nth-child(even) {
            background: ${colors.ghostwhite};
          }

          .filesDialog ol > li:nth-child(even) {
            background: ${colors.four};
          }

          .App.dragging .bar-list {
            box-shadow: 0px 12px 15px 0px rgb(0,0,0,0.0);
            background: rgba(50, 50, 50, 0);
          }

          .App .bar-list li {
            transition-property: opacity, box-shadow;
            transition-duration: 0.5s;
          }

          .App.dragging .bar-list li {
            opacity: 0.05;
          }

          .App.dragging .bar-list li.dragging {
            opacity: 1.01;
          }

          .bar-list ol {
            grid-area: results;
          }

          .main {
            position: relative;
            padding: 50px 5px 130px;
            width: 100%;
          }

          .player-alt {
            display: block;
            margin: auto auto;
            max-width: 100%;
          }
          .Player {
            margin: auto auto;
            max-width: 100%;
          }

          .Player.hidden {
            /* display: none; */
          }

          .bar-list .toggle .idx {
            color: ${colors.dimgrey};
          }
          .bar-list .track .toggle .art {
            transition-duration: 0.1s;
            transition-timing-function: ${tfns.easeInOutQuad};
          }

          .bar-list .track .toggle .art-img {
            transition-duration: 0.1s;
            transition-timing-function: ${tfns.easeInOutQuad};
          }

          .track .icon {
            width: 15px;
          }

          li:nth-child(odd) .actions {
            background-color: ${colors.eee};
          }

          li:nth-child(even) .actions {
            background-color: ${colors.whitesmoke};
          }

          .upNext>h3, .history>h3 {
            cursor: pointer;
          }

          .history>h3, .playingNow>h3, .upNext>h3 {
            transition-property: opacity, height;
            transition-duration: 0.5s;
            opacity: 1;
          }

          .history {
            opacity: 1;
            transition-property: opacity;
            transition-duration: 0.5s;
          }

          .history.hidden {
            opacity: 1;
          }

          .history.empty>h3, .playingNow.empty>h3, .upNext.empty>h3 {
            /* opacity: 0; */
          }

          .App.dragging .history>h3, .App.dragging .playingNow>h3, .App.dragging .upNext>h3 {
            opacity: 1;
          }

          .history.not-collapsed>h3 {

          }

          .collapsed>ol {
            display: none;
          }

          .upNext, .history, .playingNow {
            text-align: left;
            margin: 0 auto;
            width: 100%;
            max-width: 640px;
            color: ${colors.whitesmoke};
          }

          .emptyDropZone {
            line-height: 3em;
            text-align: center;
          }

          .playingNow {
            background: black;
          }

          .upNext ol, .history ol, .playingNow ol {
            width: 100%;
            min-height: 45px;
            transition-property: background-color;
            transition-duration: .75s
          }

          .App.dragging .history ol, .App.dragging .upNext ol {
            background: rgba(255, 255, 255, 0.5);
          }

          .App.dragging .playingNow ol {
            background: rgba(0, 0, 0, 0.5);
          }

          .App.disconnected.attending .controls button, .App.disconnected.attending .controls input, .App.disconnected.attending .controls label {
            color: ${colors.dimgrey};
          }

          .App.disconnected .seek-bar--current {
            background-color: ${colors.darkred};
          }

          .playingNow>h3 {
            color: black;
          }

          .partyName {
            color: ${colors.whitesmoke};
            font-size: xx-large;
            text-align: center;
            margin-bottom: 10px;
          }

          .queue {
            /* margin-bottom: 100px; */
          }

          .queue h3 {
            font-size: large;
            padding: 10px;
          }

          .queue .icon {
            color: ${colors.whitesmoke};
          }

          .inCollection {
            color: ${colors.green};
          }

          .notInCollection {

          }

          .figure {
            position: fixed;
            top: 0;
            right: 0;
            width: 50px;
            height: 50px;
            font-size: large;
            z-index: 4;
            cursor: pointer;
            background-repeat: no-repeat;
            background-position: top 10px right 10px;
            background-origin: content-box;
            background-size: 30px 30px;
            transition-property: background-color;
            transition-duration: 0.5s;
          }

          .figure.disconnected {
            background-image: url('static/asleep.svg');
          }
          .figure.connected {
            background-image: url('static/manga.svg');
          }
          .figure.hosting.disconnected {
            background-image: url('static/guilty.svg');
          }
          .figure.hosting.connected {
            background-image: url('static/happy.svg');
          }
          .figure.attending.disconnected {
            background-image: url('static/sad.svg')
          }
          .figure.attending.connected {
            background-image: url('static/glad.svg')
          }
          .figure.attending.host-disconnected {
            background-image: url('static/sad.svg')
          }

          .autoparty {
            transition-property: background-color, width, top, opacity;
            transition-duration: 0.4s;
            position: fixed;
            top: 50px;
            right: 0;
            z-index: 1;
            border-radius: 0 0 10px 10px;
            width: 33%;
            padding: 15px;
            opacity: 1;
          }

          .autoparty.collapsed {
            top: -7em;
            opacity: 0;
          }

          .autoparty .dismiss-button {
            width: 15px;
            height: 15px;
            float: right;
            cursor: pointer;
          }

          .autoparty h3 {
            font-size: xx-large;
            padding: 10px 5px 15px;
          }

          .autoparty.disconnected .partyBtn, .autoparty:disabled {
            color: ${colors.grey};
          }

          .autoparty h3 {
            width: 100%;
          }

          .autoparty input {
            display: block;
            width: 100%;
          }


          .autoparty .partyBtn {
            width: 100%;
          }

          .autoparty input, .autoparty button, .autoparty .copyBtn {
            padding: 5px;
            font-size: medium;
            /* border-radius: 0; */
            background: ${colors.whitesmoke};
            line-height: 1.5em;
          }

          .autoparty .copyLink {
            padding: 5px;
            font-size: medium;
            line-height: 1.5em;
            text-align: right;
            /* font-weight: bold; */
          }

          .autoparty .copyLink-url {
            margin-left: 5px;
          }

          .autoparty .copyBtn {
            cursor: pointer;
            display: inline-block; /* TODO Consider setting this in the reset styles */
            transform: translateX(5px); /* Cancels .copyLink padding to align with other inputs */
          }

          .autoparty.connected .partyBtn:enabled {
            color: ${colors.steelblue};
            cursor: pointer;
          }

          .autoparty .dismiss {
            position: absolute;
            top: 0;
            right: 0;
            border: 0;
            padding: 5px 10px;
          }

          .command, .loader {
            padding: 12px;
            line-height: 150%;
            cursor: pointer;
            font-size: large;
            border: 0;
          }

          .fuzz--match {
            font-weight: bold;
          }

          .Feedback {
            margin-top: 50px;
            text-align: center;
          }
          .Feedback form {
            padding: 10px;
            max-width: 640px;
            margin: 0 auto;
            text-align: left;
            line-height: 1.5em;
            color: ${colors.whitesmoke};
          }
          .Feedback h2 {
            font-size: x-large;
          }
          .Feedback p {
            margin: 10px;
          }
          .Feedback textarea {
            margin: 10px 0;
            width: 100%;
            height: 7em;
          }
          .Feedback [type=email] {
          }
          .Feedback label {
            margin-right: 10px;
          }
          .Feedback [type=submit] {
            float: right;
          }
          .Feedback .submitting [type=submit], .Feedback .submitted [type=submit] {
            color: ${colors.linen};
            background: rgba(200, 200, 200, 20%);
            border-color: rgba(200, 200, 200, 20%);
          }

          @media screen and (max-width: 640px) {
            .autoparty {
              width: 100%;
              border-radius: 0;
            }
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
