import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import Head from '../components/Head'
import Bar from '../components/Bar'
import Log from '../components/Log'
import AuthForm from '../components/AuthForm'

import tfns from '../styles/timing-functions'

// const isServer = typeof window === 'undefined'

class Logs extends Component {
  constructor (props) {
    super(props)
    this.loadMore = this.loadMore.bind(this)
    this.debouncedLoadMore = debounce(this.loadMore, 500, { maxWait: 750 }).bind(this) // TODO remove this debounce (possible when "loading" is implemented wherein a subsequent call would cancel, but only if calling with a different query or pageToken)
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
        this.props.dispatch({
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
            fill: currentColor;
          }

          button:enabled {
            cursor: pointer;
          }

          .App {
            transition-timing-function: ${tfns.easeInOutQuad};
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

          .bar-list ol {
            grid-area: results;
          }

          .main {
            position: relative;
            padding: 50px 5px 130px;
            width: 100%;
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
          .authForm {
            background: violet;
            padding: 1px 1px 3px 3px;
          }
        `}</style>
        <AuthForm dispatch={this.props.dispatch} className='authForm' />
        <h2>Logs</h2>
        <div className='logsContainer'>
          <Bar
            className='logsBar'
            dispatch={this.props.dispatch}
            query={this.props.bar.query}
            items={this.props.bar.items}
            hasMore={this.props.bar.hasMore}
            loadMore={this.debouncedLoadMore}
            go={(query) => {
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
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'findLogs', type: PropTypes.func.isRequired },
  { name: 'bar', type: PropTypes.object.isRequired }
]

Logs.defaultProps = defaultProps(props)
Logs.propTypes = propTypes(props)

export default Logs
