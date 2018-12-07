import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Head from '../components/Head'

// START Components we want to show
import Range from '../components/Range'
import AudioFile from '../components/AudioFile'
import YouTube from '../components/YouTube'
import NoticeList from '../components/NoticeList'
// END

// const isServer = typeof window === 'undefined'

let t0 = null
let tlast = null
const rate = 0.001 // fr per ms

class Animated extends Component {
  constructor (props) {
    super(props)
    this.startAnimations = this.startAnimations.bind(this)
    this.stopAnimations = this.stopAnimations.bind(this)
    this.step = this.step.bind(this)
    this.state = {
      animating: false,
      currentRange: 0.5,
      rangeGoal: 1,
      horizontal: 0.5,
      vertical: 0.5
    }
  }
  componentDidMount () {
    this.startAnimations()
  }
  componentWillUnmount () {
    this.stopAnimations()
  }
  startAnimations () {
    if (global.requestAnimationFrame) {
      this.setState({ animating: true })
      global.requestAnimationFrame(this.step)
    }
  }
  stopAnimations () {
    this.setState({ animating: false })
  }
  step (now) {
    if (this.state.animating) {
      if (!t0) {
        t0 = now
      }
      if (!tlast) {
        tlast = now
      }
      // const totalProgress = now - t0
      const progress = now - tlast
      const delta = rate * progress

      if (this.state.currentRange === this.state.rangeGoal) {
        this.setState({
          rangeGoal: this.state.rangeGoal === 1 ? 0 : 1
        })
      } else if (this.state.currentRange < this.state.rangeGoal) {
        const next = this.state.currentRange + delta
        const stateUpdate = {
          currentRange: Math.min(1, next)
        }
        this.setState(stateUpdate)
      } else if (this.state.currentRange > this.state.rangeGoal) {
        const next = this.state.currentRange - delta
        const stateUpdate = {
          currentRange: Math.max(0, next)
        }
        this.setState(stateUpdate)
      }
      tlast = now
      global.requestAnimationFrame(this.step)
    }
  }

  render () {
    return (
      <React.Fragment>
        <h2>Horizontal animated</h2>
        <Range
          key='range-horizontal-animated'
          className='range-horizontal'
          onChange={console.log}
          current={this.state.currentRange}
        />
        <h2>Vertical animated</h2>
        <Range
          key='range-vertical-animated'
          className='range-vertical'
          onChange={console.log}
          current={this.state.currentRange}
          vertical
        />
      </React.Fragment>
    )
  }
}

class Components extends Component {
  constructor (props) {
    super(props)
    this.state = {
      horizontal: 0.5,
      vertical: 0.7
    }
  }
  render () {
    return (
      <div className='componentsPage'>
        <Head title="Crowd's Play | Components" />
        {/* TODO Add link to icons page */}

        <h1>Range</h1>
        <h2>Horizontal</h2>
        <Range
          key='range-horizontal'
          className='range-horizontal'
          onChange={(val) => {
            this.setState({
              horizontal: val
            })
          }}
          current={this.state.horizontal}
        />
        <h2>Vertical</h2>
        <Range
          key='range-vertical'
          className='range-vertical'
          onChange={(val) => {
            this.setState({
              vertical: val
            })
          }}
          current={this.state.vertical}
          vertical
        />
        <Animated />
        <AudioFile
          data={{ name: 'Velour Tintin - Shawn Inder.mp3' }}
        />
        <YouTube
          data={{
            id: {
              videoId: '9cj4309c4349r0'
            },
            snippet: {
              title: 'Bad Guy - Eminem [Marshall Mathers LP 2]',
              channelTitle: 'emfan',
              thumbnails: {
                default: {
                  url: 'https://i.ytimg.com/vi/lxoE9mzVyMk/default.jpg'
                }
              }
            }
          }}
          actions={{
            play: {
              txt: 'play'
            }
          }}
        />
        <NoticeList
          notices={[{
            id: 'n1',
            body: 'Hello Notice',
            progress: 0.5,
            buttons: {
              ok: {
                label: 'OK'
              },
              no: {
                label: 'Cancel'
              }
            }
          }]}
          showing
        />
        <style jsx>{`
          .componentsPage {
            padding: 30px;
            position: relative;
          }
        `}</style>
        <style jsx global>{`
          body {
            background-color: #33333;
            background-image: url('/static/bg.svg');
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-size: 100% 100% !important;
          }
          .range-vertical, .range-horizontal {
            border: 1px solid black;
            cursor: pointer;
            background-color: white;
            margin: 10px;
          }
          .range-vertical .range-vertical--handle, .range-horizontal .range-horizontal--handle {
            opacity: 0;
            transition-property: opacity;
            transition-duration: 0.1s;
          }
          .range-vertical.seeking .range-vertical--handle {
            opacity: 1;
          }
          .range-horizontal.seeking .range-horizontal--handle {
            opacity: 1;
          }
          .range-vertical {
            height: 150px;
            width: 30px;
            display: inline-block;
          }
          .range-horizontal {
            width: 150px;
            height: 30px;
          }
          .range-horizontal--current, .range-vertical--current {
            background-color: chartreuse;
          }
          .range-horizontal--current {
            height: 100%;
          }
          .range-vertical--current {
            width: 100%;
            position: absolute;
            bottom: 0;
          }
          .range-vertical--handle, .range-horizontal--handle {
            width: 30px;
            height: 30px;
            background: rgba(0, 0, 0, 0.4);
            position: absolute;
            border-radius: 5px;
            border: 1px solid rgba(0, 0, 0, 0.4);
          }
          .range-vertical--handle {
            left: 0;
            margin-bottom: -15px;
            bottom: 0;
          }
          .range-horizontal--handle {
            top: 0;
            left: -15px;
          }
        `}</style>
      </div>
    )
  }
}

const props = []

Components.defaultProps = defaultProps(props)
Components.propTypes = propTypes(props)

export default Components
