import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import Head from '../components/Head'
import Bar from '../components/Bar'
import Log from '../components/Log'

// const isServer = typeof window === 'undefined'

class Logs extends Component {
  constructor (props) {
    super(props)
    this.usernameChanged = this.usernameChanged.bind(this)
    this.passwordChanged = this.passwordChanged.bind(this)
    this.dispatch = this.dispatch.bind(this)
    this.loadMore = this.loadMore.bind(this)
    this.debouncedLoadMore = debounce(this.loadMore, 500, { maxWait: 750 }).bind(this) // TODO remove this debounce (possible when "loading" is implemented wherein a subsequent call would cancel, but only if calling with a different query or pageToken)
  }
  usernameChanged (event) {
    const action = {
      type: 'Auth:setUsername',
      value: event.target.value
    }
    this.props.dispatch(action)
  }

  passwordChanged (event) {
    this.props.dispatch({
      type: 'Auth:setPassword',
      value: event.target.value
    })
  }
  dispatch (action) {
    this.props.dispatch(action)
  }
  loadMore () {
    this.props.findLogs(this.props.bar.query, this.props.bar.nextPageToken).then(({ items, hasMore, prevPageToken, nextPageToken }) => {
      if (items.length > 0) {
        const newItems = items.map((item) => {
          const id = item._id
          const obj = {
            type: 'LogEntry',
            key: id,
            data: item
          }
          return obj
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
    return (
      <div className='logsPage'>
        <Head title="Crowd's Play | Logs" />
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
            transition-timing-function: var(--ease-in-out-quint);
          }

          .App {
            padding: 0;
            position: relative;
            background-color: #33333;
            background-image: url('/static/bg.svg');
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
            background-image: url('/static/asleep.svg');
          }
          .figure.connected {
            background-image: url('/static/awake.svg');
          }
          .figure.hosting.disconnected {
            background-image: url('/static/guilty.svg');
          }
          .figure.hosting.connected {
            background-image: url('/static/happy.svg');
          }
          .figure.attending.disconnected {
            background-image: url('/static/sad.svg')
          }
          .figure.attending.connected {
            background-image: url('/static/glad.svg')
          }
          .figure.attending.host-disconnected {
            background-image: url('/static/sad.svg')
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
          .logsPage {
            height: 100%;
            width: 100%;
            padding: 0;
            position: relative;
            background-color: #4a0045;
            background-image: url('/static/bg.svg');
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-size: 100% 100% !important;
            transition-property: background-color;
            transition-duration: 1s;
            overflow: scroll;
          }

          .logsPage h2 {
            margin: 15px;
            font-size: 300%;
            color: whitesmoke;
          }

          .logsContainer {
            transform: translateX(0); /* Allows this container to bound the inner fixed positioned elements */
          }

          .logsPage .bar-list.list > ol > li {
            padding: 10px;
          }

          .logsPage .bar-list.list > ol > li:nth-child(odd) {
            background: rgba(245, 245, 245, 0.50);
          }

          .logsPage .bar-list.list > ol > li:nth-child(even) {
            background: rgba(249, 249, 255, 0.25);
          }
        `}</style>
        <form className='authForm'>
          <label>Username: </label>
          <input type='text' onChange={this.usernameChanged} />
          <label>Password: </label>
          <input type='password' onChange={this.passwordChanged} />
        </form>
        <h2>Logs</h2>
        <div className='logsContainer'>
          <Bar
            className='logsBar'
            dispatch={this.dispatch}
            query={this.props.bar.query}
            items={this.props.bar.items}
            hasMore={this.props.bar.hasMore}
            loadMore={this.debouncedLoadMore}
            suggest={(query) => {
              return this.props.findLogs(query)
            }}
            ResultComponent={Log}
            onRef={(ref) => {
              this.bar = ref
            }}
            autoFocus
            loadingTxt={'Loading...'}
            maxReachedTxt={'Max reached'}
          />
        </div>
      </div>
    )
  }
}

const props = [

]

Logs.defaultProps = defaultProps(props)
Logs.propTypes = propTypes(props)

export default Logs
