import url from 'url'
import qs from 'querystring'
import React, { Component } from 'react'

import PropTypes from 'prop-types'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import cloneDeep from 'lodash.clonedeep'
import pullAt from 'lodash.pullat'
import debounce from 'lodash.debounce'

import Head from '../components/Head'
import Bar from '../components/Bar'
import Player from '../components/Player'
import Controls from '../components/Controls'
import List from '../components/List'
import Party from '../components/Party'
import Feedback from '../components/Feedback'

import makeResultComponent from '../components/makeResultComponent'

import Dict from '../data/Dict.js'

import playNowIcon from './playNowIcon'
import jumpToIcon from './jumpToIcon'
import jumpBackToIcon from './jumpBackToIcon'
import enqueueIcon from './enqueueIcon'
import nextIcon from './nextIcon'
import dequeueIcon from './dequeueIcon'

const isServer = typeof window === 'undefined'

class App extends Component {
  static getInitialProps ({ req, res }) {
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    const linkedPartyName = req ? qs.parse(url.parse(req.url).query).name : undefined
    return { headers, acceptLanguage, linkedPartyName }
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
    this.clearPlayingNow = this.clearPlayingNow.bind(this)
    this.clearUpNext = this.clearUpNext.bind(this)
    this.clearAll = this.clearAll.bind(this)
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
    if (action.origin) {
      this.props.dispatch({
        type: 'Ack:ack',
        origin: action.origin
      })
    }
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
          case 'cancelDropZone':
            console.log('----Dropped on cancel zone')
            switch (source.droppableId) {
              case 'droppable-history':
              case 'droppable-upNext':
              case 'droppable-bar-list':
                console.log('Do nothing, cancel drag')
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
      const origin = Math.random().toString().slice(2)
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
        playing: false
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
        }} onClick={this.togglePlaying} pending={this.props.ack.pending} />
      )
      : (
        <Droppable droppableId={`droppable-playingNow`}>
          {(droppableProvided, snapshot) => {
            return (
              <ol ref={droppableProvided.innerRef} key={`playingNow-droppable`}>
                <li className='emptyDropZone'>{this.dict.get('queue.playingNow.emptyZone')}</li>
                {droppableProvided.placeholder}
              </ol>
            )
          }}
        </Droppable>
      )

    const historyClasses = ['history']
    const playingNowClasses = ['playingNow']
    const upNextClasses = ['upNext']

    let partyName = this.props.name
    if (!this.props.name && this.props.name !== '' && this.props.linkedPartyName) {
      partyName = this.props.linkedPartyName
    }
    return (
      <DragDropContext onDragStart={this.onDragStart} onDragUpdate={this.onDragUpdate} onDragEnd={this.onDragEnd}>
        <Head title="Crowd's Play" />
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
            background-color: #333333;
          }

          input[type=text].disabled {
            background: beige;
          }

          svg {
            fill: currentColor; /* For SVGs, see https://css-tricks.com/cascading-svg-fill-color/ */
          }

          button:enabled {
            cursor: pointer;
          }

          button.invisibutton {
            border: 0;
            background: transparent;
          }



          .App {
            transition-timing-function:ease-in-out;
          }

          .App {
            padding: 0;
            position: relative;
            background-color: #33333;
            background-image: url('static/bg.svg');
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-size: 100% 100% !important;
            transition-property: background-color;
            transition-duration: 1s;
            overflow: scroll;
          }

          .App.connected, .App.connected .figure, .App.connected .autoparty {
            background-color: aqua;
          }

          .App.attending, .App.attending .figure, .App.attending .autoparty {
            background-color: green;
          }

          .App.hosting, .App.hosting .figure, .App.hosting .autoparty {
            background-color: #e0b01d;
          }

          .App.disconnected, .App.disconnected .figure, .App.disconnected .autoparty {
            background-color: #666666;
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
            color: dimgrey;
            position: fixed;
            top: 5px;
            left: 5px;
            z-index: 5;
            padding: 10px;
          }

          .bar-menu:focus {
            color: whitesmoke;
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
            color: whitesmoke;
            background: #333333;
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
            color: whitesmoke;
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
            color: #aaaaaa;
          }

          .bar-dismiss {
            position: fixed;
            top: 5px;
            right: 50px;
            font-size: large;
            z-index: 4;
            padding: 13px 13px;
            color: whitesmoke;
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
            background: #333333;
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
            background: whitesmoke;
          }

          .App .bar-list.list > ol > li:nth-child(even) {
            background: ghostwhite;
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

          .youtube-result {
            display: grid;
            grid-template-columns: 100px auto 50px;
            grid-template-areas:
              "left    right corner"
              "actions actions actions"
          }

          .youtube-result .toggle {
            width: 100px;
            padding: 2px 5px;
            font-size: x-small;
            font-weight: bold;
          }

          .youtube-result .toggle img {
            margin-left: 0;
            transition-property: margin-left;
            transition-duration: 2s;
          }

          .youtube-result .toggle.toggled img {
            margin-left: 5px;
          }

          .youtube-result .toggle .idx {
            display: inline-block;
            text-align: right;
            width: 0;
            transition-property: width;
            transition-duration: 2s;
          }

          .youtube-result .toggle.toggled .idx {
            width: 25px;
          }

          .youtube-result .toggle.busy .idx {
            width: 12px;
          }

          .youtube-result .art {
            grid-area: left;
            border-radius: 5px;
          }

          .youtube-result .art img {
            border-radius: 5px;
          }

          .bar-list .toggle .idx {
            color: dimgrey;
          }
          .bar-list .youtube-result .toggle .art {
            box-shadow: inset -3px 0px 15px -3px rgba(0,0,0,0.75);
          }

          .bar-list .youtube-result .toggle.toggled .art {
            box-shadow: inset 3px 0px 15px -3px rgba(0,0,0,0.75);
          }

          .bar-list .youtube-result .toggle .art-img {
            box-shadow: 3px 0 5px 0 rgba(0, 0, 0, 0.75);
          }
          .bar-list .youtube-result .toggle.toggled .art-img {
            box-shadow: -3px 0 5px 0 rgba(0, 0, 0, 0.75);
          }

          .youtube-result .art-img {
            width: 60px;
            height: 45px;
            vertical-align: middle;
          }

          .youtube-result-info {
            grid-area: right;
          }

          .youtube-result-title {
            font-size: small;
            font-weight: bold;
          }

          .youtube-result-channel {
            font-size: x-small;
          }

          .youtube-result-title, .youtube-result-channel {
            padding: 5px;
          }

          .youtube-result .corner {
            grid-area: corner;
          }

          .youtube-result .icon {
            width: 15px;
          }

          .youtube-result.actionable {
            position: relative;
            cursor: pointer;
          }

          .youtube-result button {
            padding: 7px 15px 5px 5px;
            border: 0;
            background: transparent;
          }

          .youtube-result button span, .youtube-result button img {
            vertical-align: middle;
          }

          .youtube-result button:hover, .controls button:hover {
            color: steelblue;
          }

          .actions {
            grid-area: actions;
            width: 90%;
            position: absolute;
            color: dimgrey;
            background: whitesmoke;
            z-index: 5;
            border-radius: 5px 0 5px 5px;
            box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.5);
          }

          li:nth-child(odd) .actions {
            background-color: #eeeeee;
          }

          li:nth-child(even) .actions {
            background-color: whitesmoke;
          }

          .actions li div {
            width: 100%;
            display: grid;
            grid-template-columns: 100px auto 50px;
            grid-template-areas:
              "action-idx action-label action-icon"
          }

          .actions li div:hover {
            background: white;
          }

          .action-idx, .action-label, .action-icon {
            line-height: 20px;
            padding: 5px;
          }

          .action-idx {
            grid-area: action-idx;
            font-size: x-small;
            text-align: right;
            width: 35px;
          }

          .action-label {
            grid-area: action-label;
            border-bottom: 1px solid #ccc;
          }

          .action-icon {
            grid-area: action-icon;
            text-align: right;
            padding-right: 7px;
          }

          .action-icon svg.icon {
            color: dimgrey;
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

          .upNext>h3 {
            color: chartreuse;
          }

          .collapsed>ol {
            display: none;
          }

          .upNext, .history, .playingNow {
            text-align: left;
            margin: 0 auto;
            width: 100%;
            max-width: 640px;
            color: whitesmoke;
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

          .controls {
            position: fixed;
            z-index: 1;
            bottom: 0;
            left: 0;
            width: 100%;
            font-size: medium;
            /* background: whitesmoke; */
            /* box-shadow: 0px -2px 5px 0px rgba(0,0,0,0.25); */
          }

          .controls-buttons {
            display: grid;
            grid-template-columns: 50px minmax(50px, 1fr) 50px;
            grid-template-areas:
              "prev togglePlaying next";
            background: #333333;
          }

          .controls button {
            padding: 10px 0;
            border: 0;
            background: transparent;
            font-weight: bold;
            color: whitesmoke;
            transition-property: color;
            transition-duration: 0.5s;
          }

          .App.disconnected .controls button {
            color: dimgrey;
          }

          .controls-buttons button svg {
            width: 20px;
          }

          .seek-bar {
            grid-area: seekBar;
            border: 1px solid #000000;
            cursor: pointer;
            background-color: whitesmoke;
            transition-property: background-color;
            transition-duration: 0.5s;
          }

          .App.disconnected .seek-bar {
            background-color: dimgrey;
          }

          .seek-bar--played {
            height: 10px;
            background-color: red;
            transition-property: background-color;
            transition-duration: 0.5s;
          }

          .App.disconnected .seek-bar--played {
            background-color: darkred;
          }

          .seek-bar--handle {
            width: 30px;
            height: 30px;
            /* background: rgba(255, 0, 0, 0.4); */
            border-radius: 5px;
            position: absolute;
            top: -10px;
            left: -15px;
          }

          .playingNow>h3 {
            color: black;
          }

          .controls-prev {
            grid-area: prev;
          }
          .controls-togglePlaying {
            grid-area: togglePlaying;
          }

          .controls-next {
            grid-area: next;
          }

          .partyName {
            color: whitesmoke;
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
            color: whitesmoke;
          }

          .inCollection {
            color: green;
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
            background-image: url('static/awake.svg');
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
            color: grey;
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
            background: whitesmoke;
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
            color: steelblue;
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
            color: whitesmoke;
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
            color: linen;
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
            componentProps={{
              pending: this.props.ack.pending
            }}
            ResultComponent={makeResultComponent({
              actions: {
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
            })}
            onResult={{
              'space': this.enqueue,
              'ctrl+enter': this.enqueue,
              'shift+enter': this.playNext,
              'ctrl+shift+enter': this.play
            }}
            commands={{
              clearHistory: this.clearHistory,
              clearPlayingNow: this.clearPlayingNow,
              clearUpNext: this.clearUpNext,
              clearAll: this.clearAll,
              toggleShowHistory: this.toggleShowHistory,
              toggleShowUpNext: this.toggleShowUpNext,
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
            />
            <h3 className='partyName'>{partyName}</h3>
            <div className='queue'>
              <List
                showLabel={`${this.dict.get('queue.history.show')} (${state.queue.history.length})`}
                hideLabel={`${this.dict.get('queue.history.hide')} (${state.queue.history.length})`}
                className={historyClasses.join(' ')}
                items={state.queue.history}
                componentProps={{
                  pending: this.props.ack.pending
                }}
                defaultComponent={makeResultComponent({
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
                })}
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
                  ) : null}
              </section>
              <List
                className={upNextClasses.join(' ')}
                items={state.queue.upNext}
                componentProps={{
                  pending: this.props.ack.pending
                }}
                defaultComponent={makeResultComponent({
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
                })}
                onItem={{
                }}
                collapsible
                areDraggable
                empty={<li key='upNext-emptyDropZone'><div className='emptyDropZone'>{this.dict.get('queue.upNext.emptyZone')}</div></li>}
              />
            </div>
            <Feedback
              dispatch={this.dispatch}
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
  { name: 'socketKey', type: PropTypes.string.isRequired }
]

App.defaultProps = defaultProps(props)
App.propTypes = propTypes(props)

export default App
