import { EventEmitter } from 'events'

import React, { useEffect, useContext, useRef, useState, useCallback } from 'react'

import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import cloneDeep from 'lodash.clonedeep'
import pullAt from 'lodash.pullat'
import debounce from 'lodash.debounce'

import Media from '../data/Media'

import Store from './Store'
import Head from './Head'
import CopyButton from './CopyButton'
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
import Menu from './Menu'
import FilesDialog from './FilesDialog'
import CancelDropZone from './CancelDropZone'
import Spotlight from './icons/Spotlight'

import getDragAndDropActions from '../features/dragAndDrop/getActions'

import playNowIcon from './icons/playNow'
import jumpToIcon from './icons/jumpTo'
import jumpBackToIcon from './icons/jumpBackTo'
import enqueueIcon from './icons/enqueue'
import nextIcon from './icons/next'
import dequeueIcon from './icons/dequeue'
import AddIcon from './icons/AddWink'
import PlayRandom from './icons/PlayRandom'
import TrackButton from './TrackButton'

import DictContext from '../features/dict/context'
import colors from '../styles/colors'
import alpha from '../helpers/alpha'
import tfns from '../styles/timing-functions'
import durations from '../styles/durations'
import lengths from '../styles/lengths'

import resetStyles from '../styles/reset'
import baseStyles from '../styles/base'

import AppContext from '../features/app/context'
import useApp from '../features/app/use'

import NoticeContext from '../features/notice/context'
import useNotice from '../features/notice/use'

import PartyContext from '../features/party/context'
import useParty from '../features/party/use'

import PlayerContext from '../features/player/context'
import usePlayer from '../features/player/use'
import useQueue from '../features/queue/use'

import QueueContext from '../features/queue/context'

import AckContext from '../features/ack/context'
import useAck from '../features/ack/use'

import BarContext from '../features/bar/context'
import useBar from '../features/bar/use'

import FileInputContext from '../features/fileInput/context'
import useFileInput from '../features/fileInput/use'

import useListeners from '../features/listeners/use'
import passiveSupported from '../helpers/passiveSupported'

const listenerOptions = passiveSupported ? { passive: true, capture: false } : false

const isServer = typeof window === 'undefined'

const CHUNK_SIZE = 100000

const media = new Media()

function App (props) {
  const visibleFiles = useRef({})
  const db = useRef(null)
  const playerEl = useRef(null)
  const barEl = useRef(null)
  const debouncedLoadMore = useRef(debounce(loadMore, 500, { maxWait: 750 })) // TODO remove this debounce (possible when "loading" is implemented wherein a subsequent call would cancel, but only if calling with a different query or pageToken)

  const { dict } = useContext(DictContext)

  const [noticeState, noticeDispatch, notify] = useNotice()

  const [appState, appDispatch] = useApp()
  const [ackState, ackDispatch] = useAck()
  const [barState, barDispatch] = useBar()
  const [playerState, originalPlayerDispatch, listeners] = usePlayer()
  const [queueState, originalQueueDispatch] = useQueue()
  const [fileInputState, fileInputDispatch] = useFileInput()

  const [
    partyState,
    partyDispatch,
    { socket,
      useSync,
      inspectServer: inspectPartyServer,
      intercepted: [playerDispatch, queueDispatch]
    }
  ] = useParty({
    intercept: [originalPlayerDispatch, originalQueueDispatch]
  })

  const [currentState, setCurrentState] = useState(partyState.attending
    ? partyState.state
    : { queue: queueState, player: playerState })

  useEffect(() => {
    setCurrentState(partyState.attending
      ? partyState.state
      : { queue: queueState, player: playerState })
  }, [partyState, queueState, playerState])

  useSync(ackState, 'ack')
  useSync(playerState, 'player')
  useSync(queueState, 'queue')

  const dispatchers = {
    Ack: ackDispatch,
    App: appDispatch,
    Queue: queueDispatch,
    Bar: barDispatch,
    Party: partyDispatch,
    Player: playerDispatch,
    FileInput: fileInputDispatch,
    Notice: noticeDispatch
  }

  function centralDispatch (action) {
    const colonIdx = action.type.indexOf(':')
    if (colonIdx === -1) {
      throw new Error('No colon found in action.type')
    }
    const dispatcher = action.type.substr(0, colonIdx)
    if (dispatcher.length === 0) {
      throw new Error('Nothing before colon in action.type')
    }
    const dispatch = dispatchers[dispatcher]
    if (!dispatch) {
      throw new Error('Dispatcher not found')
    }
    return dispatch(action)
  }

  useListeners({
    'esc': () => {
      barEl.current.focus()
    },
    'ctrl+space': () => {
      togglePlaying()
    }
  }, { eventTarget: global, listenerOptions })

  useEffect(() => {
    if (!isServer) {
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
          db.current = request.result

          db.current.onerror = function (event) {
            console.log('Error creating/accessing IndexedDB database')
          }

          // Interim solution for Google Chrome to create an objectStore. Will be deprecated
          if (db.current.setVersion) {
            if (db.current.version !== dbVersion) {
              const setVersion = db.current.setVersion(dbVersion)
              setVersion.onsuccess = function () {
                createObjectStore(db.current)
              }
            }
          }
        }

        // For future use. Currently only in latest Firefox versions
        request.onupgradeneeded = (event) => {
          createObjectStore(event.target.result)
        }
      }
      return () => {
        console.log('Closing IndexedDB')
        if (db.current) {
          db.current.close()
        }
      }
    }
  }, [])

  function getPartyState () {
    return partyState.attending
      ? partyState.state
      : { queue: queueState, player: playerState }
  }

  function file (data) {
    global.document.querySelector('.controls-newFile').click()
  }

  function makeOrigin () {
    return partyState.attending ? Math.random().toString().slice(2) : undefined
  }

  function gotDispatch (action) {
    centralDispatch(action)
    if (action.type === 'Player:setVolume') {
      setPlayerVolume(action.value)
    } else if (action.type === 'Queue:seekTo') {
      seekTo(action.value)
    }
    if (action.origin) {
      ackDispatch({
        type: 'Ack:ack',
        origin: action.origin
      })
    }
  }

  function gotFileChunk (msg) {
    const key = msg.key
    const transaction = db.current.transaction(['guestFiles'], 'readwrite')
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
        const concatenated = new global.Blob([get.result, chunk], { type: 'audio' })
        newLength = concatenated.size
        const put = objectStore.put(concatenated, key)
        put.onsuccess = function (event) {
          console.log('====PUT SUCCESS')
        }
        put.onerror = (event) => {
          console.log('====PUT ERROR', event, put.result)
        }
      } else {
        const chunkBlob = new global.Blob([chunk], { type: 'audio' })
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
        socket.emit('requestChunk', { fileKey: key, start: newLength, guestKey: msg.guestKey })
      } else {
        socket.emit('gotFile', { fileKey: key, guestKey: msg.guestKey })
      }
    }
    get.onerror = (event) => {
      console.log('====GET ERROR', event, get.result)
    }
  }

  function setPlayerVolume (value) {
    if (playerEl.current) {
      const internal = playerEl.current.getInternalPlayer()
      if (internal.setVolume) {
        internal.setVolume(value * 100)
      }
    }
  }

  function gotState (state) {
    partyDispatch({
      type: 'Party:gotState',
      state
    })
  }

  function gotSlice (slice) {
    partyDispatch({
      type: 'Party:gotSlice',
      slice
    })
  }

  function onDragStart (data, { announce }) {
    // TODO Use `announce` to deliver an aural message to screen readers
    appDispatch({
      type: 'App:dragging',
      value: true,
      data
    })
  }

  function onDragUpdate (data, { announce }) {
    // TODO Use `announce` to deliver an aural message to screen readers
  }

  function onDragEnd ({ type, reason, destination, source }, { announce }) {
    // TODO Use `announce` to deliver an aural message to screen readers
    appDispatch({
      type: 'App:dragging',
      value: false
    })
    if (type === 'DEFAULT' && reason === 'DROP') {
      if (destination) { // else item was returned to initial position or such noop
        const currentPartyState = getPartyState()
        const origin = makeOrigin()
        const fromBar = barState.items[source.index]
        getDragAndDropActions({ source, destination, origin, fromBar, state: { ...currentPartyState, fileInput: fileInputState } })
          .map(centralDispatch)
      }
    }
  }

  function sendFile (action) {
    const handler = new EventEmitter()
    let canceled = false
    handler.cancel = () => {
      canceled = true
      socket.emit('cancelSendFile', {
        ...action,
        name: partyState.name,
        socketKey: partyState.socketKey
      })
    }
    const key = action.key
    const file = visibleFiles.current[key]
    const fileSize = file.size
    const fileReader = new global.FileReader()
    const firstSlice = file.slice(0, Math.min(CHUNK_SIZE, fileSize), 'audio')
    fileReader.readAsArrayBuffer(firstSlice)
    const fn = ({ fileKey, start }) => {
      if (fileKey === key) {
        handler.emit('progress', start / fileSize)
        if (!canceled) {
          const chunkSize = Math.min(CHUNK_SIZE, fileSize - start)
          const slice = file.slice(start, start + chunkSize, 'audio')
          const reader = new global.FileReader()
          reader.readAsArrayBuffer(slice)
          reader.onload = (event) => {
            const arrayBuffer = reader.result
            socket.emit('file-transfer-chunk', {
              ...action,
              fileSize,
              arrayBuffer,
              name: partyState.name,
              socketKey: partyState.socketKey
            })
          }
        }
      }
    }
    socket.on('requestChunk', fn)
    const done = ({ fileKey }) => {
      if (key === fileKey) {
        handler.emit('success')
        socket.off('gotFile', done)
        socket.off('requestChunk', done)
      }
    }
    socket.on('gotFile', done)
    fileReader.onload = (event) => {
      const arrayBuffer = fileReader.result
      socket.emit('file-transfer-chunk', {
        ...action,
        fileSize,
        arrayBuffer,
        name: partyState.name,
        socketKey: partyState.socketKey
      })
    }
    return handler
  }

  function play (data) {
    playNow(data)
    playerDispatch({
      type: 'Player:setPlaying',
      playing: true
    })
  }

  const playNow = useCallback((data) => {
    const origin = makeOrigin()
    if (currentState.queue.now.key) {
      queueDispatch({
        type: 'Queue:toHistory',
        data: currentState.queue.now,
        origin
      })
    }
    // play track
    queueDispatch({
      type: 'Queue:play',
      data,
      origin
    })
    playerDispatch({
      type: 'Player:setPlaying',
      playing: true
    })
  }, [currentState])

  const togglePlaying = useCallback(() => {
    if (currentState.queue.now.key) {
      const newPlaying = !currentState.player.playing
      playerDispatch({
        type: 'Player:setPlaying',
        playing: newPlaying
      })
    } else {
      queueDispatch({
        type: 'Queue:next'
      })
    }
  }, [currentState])

  function playNext (data) {
    const newData = cloneDeep(data)
    queueDispatch({
      type: 'Queue:playNext',
      data: newData,
      origin: makeOrigin()
    })
  }

  function enqueue (data) {
    const newData = cloneDeep(data)
    newData.key = data.key
    const origin = makeOrigin()
    if (partyState.attending) {
      ackDispatch({
        type: 'Ack:addPending',
        dispatching: 'Queue:enqueue',
        data: newData,
        origin
      })
      const confirm = (obj) => {
        if (obj.ack && obj.ack.origin === origin) {
          socket.off('slice', confirm)
          ackDispatch({
            type: 'Ack:removePending',
            dispatching: 'Queue:enqueue',
            data: newData,
            origin
          })
        }
      }
      socket.on('slice', confirm)
    }
    queueDispatch({
      type: 'Queue:enqueue',
      data: newData,
      origin
    })
  }

  const dequeue = useCallback((data, idx, queueIndex, event) => {
    const origin = makeOrigin()

    if (queueIndex > 0) {
      const newUpNext = cloneDeep(currentState.queue.upNext)
      pullAt(newUpNext, queueIndex - 1)
      queueDispatch({
        type: 'Queue:dequeue',
        newUpNext,
        origin
      })
    } else if (queueIndex < 0) {
      const newHistory = cloneDeep(currentState.queue.history)
      pullAt(newHistory, newHistory.length + queueIndex)
      queueDispatch({
        type: 'Queue:dequeue',
        newHistory,
        origin
      })
    } else if (queueIndex === 0) {
      // TODO
    }
  }, [currentState])

  // remember (data) {
  //   props.dispatch({
  //     type: 'Collection:toggle',
  //     data
  //   })
  // }

  // isInCollection (data) {
  //   return !!props.collection[data.key]
  // }

  function clearHistory (data) {
    queueDispatch({
      type: 'Queue:clearHistory'
    })
  }

  function clearPlayingNow (data) {
    queueDispatch({
      type: 'Queue:clearPlayingNow'
    })
  }

  function clearUpNext (data) {
    queueDispatch({
      type: 'Queue:clearUpNext'
    })
  }

  function clearAll (data) {
    queueDispatch({
      type: 'Queue:clearAll'
    })
  }

  function toggleShowHistory (data) {
    appDispatch({
      type: 'App:toggleShowHistory'
    })
  }

  function toggleShowUpNext (data) {
    appDispatch({
      type: 'App:toggleShowUpNext'
    })
  }

  function toggleShowFiles (data) {
    appDispatch({
      type: 'App:toggleShowFiles'
    })
  }

  function toggleWIP (data) {
    appDispatch({
      type: 'App:toggleWIP'
    })
  }

  function jumpTo (data, idx) {
    queueDispatch({
      type: 'Queue:jumpTo',
      data,
      idx
    })
    setPlaying(true)
  }

  function setPlaying (playing) {
    playerDispatch({
      type: 'Player:setPlaying',
      playing
    })
  }

  const jumpBackTo = useCallback((data, idx) => {
    const len = currentState.queue.history.length
    queueDispatch({
      type: 'Queue:jumpTo',
      data,
      idx: -(len - 1 - idx + 1)
    })
    setPlaying(true)
  }, [currentState])

  function restartTrack () {
    if (partyState.attending) {
      queueDispatch({ type: 'Queue:restartTrack' })
    } else if (playerEl.current) {
      playerEl.current.seekTo(0)
    }
  }

  function seekTo (value) {
    if (partyState.attending) {
      queueDispatch({
        type: 'Queue:seekTo',
        value
      })
    } else if (playerEl.current && value) {
      playerEl.current.seekTo(value)
    }
  }

  function setVolume (value) {
    playerDispatch({
      type: 'Player:setVolume',
      value
    })
    if (!partyState.attending && playerEl.current) {
      setPlayerVolume(value)
    }
  }

  const onTrackEnd = useCallback(() => {
    const len = currentState.queue.upNext.length
    if (len > 0) {
      queueDispatch({
        type: 'Queue:next'
      })
    } else {
      playerDispatch({
        type: 'Player:setPlaying',
        playing: false
      })
    }
  }, [currentState])

  const decorateItem = useCallback((item) => {
    const decorated = cloneDeep(item)
    let queueIndex = null
    const history = currentState.queue.history
    if (history.length > 0) {
      history.forEach((track) => {
        if (track.key === decorated.key) {
          queueIndex = track.queueIndex
        }
      })
    }
    const upNext = currentState.queue.upNext
    if (upNext.length > 0) {
      upNext.forEach((track) => {
        if (track.key === decorated.key) {
          queueIndex = track.queueIndex
        }
      })
    }
    const now = currentState.queue.now
    if (now.key === decorated.key) {
      queueIndex = now.queueIndex
    }
    const inQueue = (queueIndex !== null)
    decorated.inQueue = inQueue
    decorated.queueIndex = queueIndex
    return decorated
  }, [currentState])

  function findMusic (query, nextPageToken) {
    return media.search({ query }, nextPageToken)
  }

  function loadMore () {
    findMusic(barState.query, barState.nextPageToken).then(({ items, hasMore, prevPageToken, nextPageToken }) => {
      if (items.length > 0) {
        // TODO dedupe or warn youtube and find another key for the items
        barDispatch({
          type: 'Bar:setItems',
          items: barState.items.concat(items),
          hasMore,
          prevPageToken,
          nextPageToken
        })
      }
    })
  }

  const getTrackEvents = useCallback(() => {
    return {
      'space': (data, idx, event) => {
        if (data.inQueue) {
          if (data.queueIndex < 0) {
            dequeue(data, idx, data.queueIndex, event)
          } else if (data.queueIndex > 0) {
            dequeue(data, idx, data.queueIndex, event)
          } else if (data.queueIndex === 0) {
            togglePlaying()
          } else {
            throw new Error('Non-numerical queue index')
          }
        } else {
          if (currentState.queue.now.key) {
            enqueue(data, idx, event)
          } else {
            playNow(data, idx, event)
          }
        }
      },
      'ctrl+enter': enqueue,
      'shift+enter': playNext,
      'ctrl+shift+enter': play
    }
  }, [currentState])

  function playRandom () {
    // TODO
  }

  function addRandom () {
    // TODO
  }

  function getComponentProps (_state) {
    return {
      pending: ackState.pending,
      playingNow: _state.queue.now.key,
      isPlaying: _state.player.playing
    }
  }

  const appClasses = ['App']

  if (socket) {
    if (socket.connected) {
      appClasses.push('connected')
    } else {
      appClasses.push('disconnected')
    }
  }
  if (partyState.attending) {
    appClasses.push('attending')
  }
  if (partyState.hosting) {
    appClasses.push('hosting')
  }
  if (appState.dragging) {
    appClasses.push('dragging')
  }

  let playingNowZone

  if (currentState.queue.now.key) {
    playingNowZone = (
      <Smart
        key='Playing-Now'
        data={{
          ...currentState.queue.now,
          inQueue: true,
          queueIndex: 0
        }}
        onClick={togglePlaying}
        pending={ackState.pending}
        playingNow={currentState.queue.now.key}
        isPlaying={currentState.player.playing}
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
              <li className='emptyDropZone' key='playingNow-emptyDropZone'>
                <Spotlight variant='surprised' />
                <p className='spotlight-caption'>Your playlist is empty...</p>
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
  playingNowClasses.push(appState.playerMode)
  const upNextClasses = ['upNext']

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
  const defaultActions = {
    enqueue: {
      targetIdx: currentState.queue.upNext.length + 1,
      go: enqueue,
      txt: dict.get('actions.enqueue'),
      icon: enqueueIcon,
      cdn
    },
    playNext: {
      targetIdx: 1,
      go: playNext,
      txt: dict.get('actions.playNext'),
      icon: nextIcon,
      cdn
    },
    play: {
      targetIdx: 0,
      go: play,
      txt: dict.get('actions.playNow'),
      icon: playNowIcon,
      cdn
    },
    jumpBackTo: {
      targetIdx: 0,
      go: jumpBackTo,
      txt: dict.get('actions.jumpBackTo'),
      icon: jumpBackToIcon,
      cdn: cdnNeg
    },
    jumpTo: {
      targetIdx: 0,
      go: jumpTo,
      txt: dict.get('actions.jumpTo'),
      icon: jumpToIcon,
      cdn: cdnPos
    },
    remove: {
      targetIdx: null,
      go: dequeue,
      txt: dict.get('actions.remove'),
      icon: dequeueIcon,
      cdn: cdnQueued
    }
  }

  return (
    <Store providers={[
      [BarContext, { state: barState, dispatch: barDispatch }],
      [AppContext, { state: appState, dispatch: appDispatch }],
      [AckContext, { state: ackState, dispatch: ackDispatch }],
      [PlayerContext, { state: playerState, dispatch: playerDispatch }],
      [QueueContext, { state: queueState, dispatch: queueDispatch }],
      [PartyContext, { state: partyState, dispatch: partyDispatch, socket }],
      [NoticeContext, { state: noticeState, dispatch: noticeDispatch, notify }],
      [FileInputContext, { state: fileInputState, dispatch: fileInputDispatch }]
    ]}>
      <DragDropContext onDragStart={onDragStart} onDragUpdate={onDragUpdate} onDragEnd={onDragEnd}>
        <Head title="Crowd's Play" />
        <style jsx global>{`
          ${resetStyles}

          ${baseStyles}

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
            -webkit-overflow-scrolling: touch;
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

          .App.dragging .history>h3, .App.dragging .playingNow>h3, .App.dragging .upNext>h3 {
            opacity: 1;
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
        `}</style>
        <style jsx>{`
          .App {
            padding: 0;
            position: relative;
            background-color: ${colors.primaryBg};
            min-width: ${lengths.minWidth};
            transition-property: background-color;
            transition-duration: ${durations.moment};
            transition-timing-function: ${tfns.easeInOutQuad};

            &.connected {
              background-color: ${colors.primary};
            }
            &.hosting  {
              background-color: ${colors.hostingBg};
            }
            &.attending {
              background-color: ${colors.attendingBg};
            }
            &.disconnected {
              background-color: ${colors.textBg};
            }
          }

          .bgImg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          main {
            margin-top: ${lengths.rowHeight};
            position: relative;
            width: 100%;
            height: 100%;
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 100px;
            :global(.spotlight) {
              width: 205px;
              height: 205px;
              border-radius: 205px;
              padding: 10px;
              margin: 0 auto;
              :global(.jingles, .jingles-shadow) {
                width: 150px;
                height: 150px;
              }
              :global(.jingles-shadow) {
                filter: blur(5px);
              }
            }
            :global(.spotlight-caption) {
              text-align: center;
              padding: 10px;
            }
            .history {
              opacity: 1;
              transition-property: opacity;
              transition-duration: ${durations.moment};
              :global(&>h3) {
                cursor: pointer;
                font-size: medium;
                padding: 10px;
                transition-property: opacity, height;
                transition-duration: ${durations.moment};
                opacity: 1;
              }
            }
            .playingNow {
              background: ${alpha(colors.text, 1 - colors.opacity)};
              color: ${colors.textBg};
              position: relative;
              margin-bottom: ${lengths.mediaHeight};
              :global(.Artwork) {
                top: 0;
                left: 0;
                max-width: ${lengths.mediaWidth};
                max-height: ${lengths.mediaHeight};
                width: 100%;
                position: relative;
                z-index: 0;
              }
              :global(.art .idx) {
                width: 0;
              }
              :global(.art .art-img) {
                width: 88px;
                height: 60px;
                border-radius: 0;
              }
              :global(.emptyDropZone) {
                padding: 20px;
              }
            }
            .postQueue {
              margin: ${lengths.rowHeight} auto;
              max-width: ${lengths.mediaWidth};
            }
            .warning {
              display: block;
              padding: 5px;
              width: 100%;
              text-align: center;
              a {
                margin-left: ${lengths.rowHeight};
                text-decoration: underline;
              }
            }
          }
          .copyButtonContainer {
            text-align: center;
            margin: 5px 0;
            padding: 40px 0 0;
          }
        `}</style>
        <div className={appClasses.join(' ')}>
          <img key='bgImg' className='bgImg' src='/static/bg.svg' alt='Blue gradient' />
          <Bar
            dispatch={barDispatch}
            placeholder={dict.get('bar.placeholder')}
            query={barState.query}
            items={barState.items}
            decorateItem={decorateItem}
            hasMore={barState.hasMore}
            loadMore={debouncedLoadMore.current}
            go={(query) => {
              return findMusic(query)
            }}
            componentProps={{
              ...getComponentProps(currentState),
              actions: defaultActions
            }}
            ResultComponent={YouTube}
            onResult={getTrackEvents()}
            commands={{
              clearAll,
              clearHistory,
              clearPlayingNow,
              clearUpNext,
              inspectPartyServer,
              file,
              toggleShowHistory,
              toggleShowUpNext,
              toggleWIP
            }}
            filters={{
              // TODO
              // Component:
              // history: queueState.history,
              // upNext: queueState.upNext,
              // artist: props.findArtist
              // track: props.findTracks
              // collection: props.collection
              // playlist: props.collection.playlists
              //
            }}
            onRef={barEl}
            loadingTxt={dict.get('bar.loading')}
            maxReachedTxt={dict.get('bar.maxReached')}
          />
          <CancelDropZone className='cancelDropZone'>
            {dict.get('app.cancelDrop')}
          </CancelDropZone>
          <Menu
            partyState={currentState}
            showWIP={appState.showWIP}
          />
          <main>
            {appState.showWIP ? (
              <mark className='warning'>
                Unfinished features enabled
                <a
                  onClick={(event) => {
                    appDispatch({ type: 'App:toggleWIP' })
                  }}
                >deactivate</a>
              </mark>
            ) : null}
            <div className='copyButtonContainer'>
              {'\u00A0'} {/* &nbsp; */}
              {partyState.hosting || partyState.attending
                ? (
                  <CopyButton
                    text={dict.get('party.copyBtn')}
                    onSuccess={(event) => {
                      // event.clearSelection()
                      notify({
                        id: `party.linkCopied${Math.random()}`,
                        body: dict.get('party.linkCopied'),
                        duration: 2000
                      })
                    }}
                    onError={(event) => {
                      console.error('Clipboard error', event)
                      // TODO
                    }}
                  />
                ) : null
              }
            </div>
            <Party
              placeholder={dict.get('party.placeholder')}
              linkedPartyName={props.linkedPartyName}
              gotState={gotState}
              gotSlice={gotSlice}
              gotDispatch={gotDispatch}
              pending={ackState.pending}
              gotFileChunk={gotFileChunk}
              autoFocus
            />
            <List
              showLabel={`${dict.get('queue.history.show')} (${currentState.queue.history.length})`}
              hideLabel={`${dict.get('queue.history.hide')} (${currentState.queue.history.length})`}
              className={historyClasses.join(' ')}
              items={currentState.queue.history}
              componentProps={{
                ...getComponentProps(currentState),
                actions: defaultActions
              }}
              defaultComponent={Smart}
              startsClosed
              collapsible
              areDraggable
              hidden={currentState.queue.history.length === 0}
            />
            <div className={playingNowClasses.join(' ')} key='playingNow'>
              {playingNowZone}
              {(currentState.queue.now.key && !partyState.attending)
                ? (
                  <Player
                    onRef={playerEl}
                    playingNow={currentState.queue.now}
                    playing={currentState.player.playing}
                    onEnded={onTrackEnd}
                    listeners={listeners}
                    controls
                  />
                ) : null}
              {(currentState.queue.now.key && partyState.attending)
                ? (
                  <Artwork
                    playingNow={currentState.queue.now}
                    isPlaying={currentState.player.playing}
                    className='Artwork'
                    onClick={(event) => {
                      event.stopPropagation()
                      playerDispatch({
                        type: 'Player:togglePlaying'
                      })
                    }}
                  />
                ) : null}
            </div>
            <List
              className={upNextClasses.join(' ')}
              items={currentState.queue.upNext}
              componentProps={{
                ...getComponentProps(currentState),
                actions: defaultActions
              }}
              defaultComponent={Smart}
              areDraggable
              emptyComponent={<li key='upNext-emptyDropZone'><p className='emptyDropZone'>{dict.get('queue.upNext.emptyZone')}</p></li>}
            />
            {appState.showWIP ? (
              <section className='postQueue'>
                <TrackButton
                  icon={PlayRandom}
                  caption={(currentState.queue.now.key || currentState.queue.upNext.length > 0)
                    ? 'Add random track'
                    : 'Play random track'}
                  onClick={() => {
                    if (currentState.queue.now.key || currentState.queue.upNext.length > 0) {
                      addRandom()
                    } else {
                      playRandom()
                    }
                  }}
                />
                <TrackButton
                  icon={AddIcon}
                  caption='Add a track from your device'
                  onClick={() => {
                    console.log('+track')
                  }}
                />
              </section>
            ) : null}
            <Feedback />
          </main>
          <Controls
            f={currentState.player.f}
            t={currentState.player.t}
            history={currentState.queue.history}
            upNext={currentState.queue.upNext}
            restartTrack={restartTrack}
            playing={currentState.player.playing}
            togglePlaying={() => {
              playerDispatch({
                type: 'Player:togglePlaying'
              })
            }}
            toggleShowHistory={toggleShowHistory}
            toggleShowUpNext={toggleShowUpNext}
            seekTo={seekTo}
            setVolume={setVolume}
            volume={partyState.attending ? partyState.state.player.v : playerState.v}
            nbFiles={fileInputState.files.length}
            toggleShowFiles={toggleShowFiles}
            newFileInput={() => {
              fileInputDispatch({
                type: 'FileInput:new',
                idx: fileInputState.files.length > 0 ? fileInputState.files.length - 1 : 0
              })
              if (!appState.showFiles) {
                toggleShowFiles()
              }
            }}
            showingFiles={appState.showFiles}
            showWIP={appState.showWIP}
            showVolume={appState.showVolume}
          />
          <FilesDialog
            items={fileInputState.files}
            state={currentState}
            actions={defaultActions}
            attending={partyState.attending}
            getComponentProps={getComponentProps}
            showFiles={appState.showFiles}
            getTrackEvents={getTrackEvents}
            visibleFiles={visibleFiles.current}
            sendFile={sendFile}
          />
        </div>
      </DragDropContext>
      <NoticeList
        key='notice-list'
        showing={noticeState.showing.length > 0}
        notices={noticeState.showing}
      />
    </Store>
  )
}

export default App
