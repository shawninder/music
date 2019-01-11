import React, { Component } from 'react'
import PropTypes from 'prop-types'

import imgDataToUrl from '../helpers/imgDataToUrl'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import cancelIcon from './icons/cancel'
import moreIcon from './icons/more'

import ActionList from './ActionList'

import tfns from '../styles/timing-functions'

const isServer = typeof window === 'undefined'

class Track extends Component {
  constructor (props) {
    super(props)
    this.globalClick = this.globalClick.bind(this)
    this.showActions = this.showActions.bind(this)
    this.hideActions = this.hideActions.bind(this)
    this.toggleActions = this.toggleActions.bind(this)
    this.onClick = this.onClick.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.state = {
      showingActions: false
    }
  }
  componentDidMount () {
    if (!isServer) {
      global.addEventListener('click', this.globalClick, false)
    }
  }
  componentWillUnmount () {
    if (!isServer) {
      global.removeEventListener('click', this.globalClick, false)
    }
  }
  globalClick (event) {
    if (this.state.showingActions) {
      this.hideActions()
    }
  }
  hideActions () {
    this.setState({
      showingActions: false
    })
  }
  showActions () {
    this.setState({
      showingActions: true
    })
    setTimeout(() => {
      if (this.actions) {
        const li = this.actions.childNodes[0]
        if (li) {
          li.childNodes[0].focus()
        }
      }
    }, 0)
  }
  toggleActions (event) {
    event.stopPropagation()
    if (this.state.showingActions) {
      this.hideActions()
    } else {
      this.showActions()
    }
  }
  onClick (event) {
    if (Object.keys(this.props.actions).length > 0) {
      this.toggleActions(event)
    }
  }
  onToggle (event) {
    if (!this.props.data.inQueue) {
      event.stopPropagation()
      if (!this.props.playingNow || !this.props.isPlaying) {
        if (this.props.actions.play) {
          this.props.actions.play.go(this.props.data)
        }
      } else {
        if (this.props.actions.enqueue) {
          this.props.actions.enqueue.go(this.props.data)
        }
      }
    }
  }
  render () {
    const trackClasses = this.props.className ? this.props.className.split(' ') : []
    trackClasses.push('track')
    const toggleClasses = this.props.toggleClasses ? this.props.toggleClasses.split(' ') : []
    toggleClasses.push('toggle')
    if (this.props.data.inQueue) {
      toggleClasses.push('toggled')
    }
    if (this.props.busy) {
      toggleClasses.push('busy')
    }
    const actionToggleClasses = ['actionToggle']
    const actionToggleIcon = this.state.showingActions ? cancelIcon : moreIcon
    const actionListClasses = ['actions']
    let artSrc = this.props.artSrc
    if (this.props.artFormat && this.props.artData) {
      artSrc = imgDataToUrl(this.props.artData, this.props.artFormat)
    }
    return (
      <div
        className={trackClasses.join(' ')}
        onClick={this.onClick}
      >
        <div
          className={toggleClasses.join(' ')}
          onClick={this.onToggle}
        >
          <div className='art'>
            <div className='idx'>
              {this.props.data.queueIndex === 0 ? '' : this.props.data.queueIndex}
            </div>
            <img
              className='art-img'
              src={artSrc}
              alt={this.props.artAlt}
              {...this.props.dragHandleProps}
            />
          </div>
        </div>
        <div className='body'>
          {this.props.children}
        </div>
        {Object.keys(this.props.actions).length > 0 ? (
          <React.Fragment>
            <button
              className={actionToggleClasses.join(' ')}
              onClick={this.toggleActions}
            >
              {actionToggleIcon}
            </button>
            <ActionList
              className={actionListClasses.join(' ')}
              actions={this.props.actions}
              data={this.props.data}
              idx={this.props.idx}
              queueIndex={this.props.data.queueIndex}
              showing={this.state.showingActions}
              actionsAbove={this.props.actionsAbove}
              onRef={(ref) => {
                this.actions = ref
              }}
              onGo={() => {
                this.setState({
                  showingActions: false
                })
              }}
            />
          </React.Fragment>
        ) : null}
        <style jsx>{`
          .track {
            position: relative;
            cursor: pointer;
            display: grid;
            grid-template-columns: 100px auto 50px;
            grid-template-rows: 1fr;
            grid-template-areas:
              "actionListAbove  actionListAbove  actionListAbove"
              "left             right            corner"
              "actionListBelow  actionListBelow  actionListBelow"
          }

          .toggle {
            width: 100px;
            padding: 2px 5px;
            font-size: x-small;
            font-weight: bold;
            grid-area: left;
          }

          .art {
            border-radius: 5px;
          }

          .idx {
            display: inline-block;
            width: 25px;
            text-align: right;
            transform: translate(-25px);
            transition-property: transform;
            transition-duration: 0.1s;
            transition-timing-function: ${tfns.easeInOutQuad};
          }

          .busy .idx {
            transform: translate(-13px);
          }

          .toggled .idx {
            transform: translate(-5px);
          }

          .art-img {
            border-radius: 5px;
            width: 60px;
            height: 45px;
            vertical-align: middle;
            transform: translate(-25px);
            transition-property: transform;
            transition-duration: 0.1s;
            transition-timing-function: ${tfns.easeInOutQuad}
          }
          .busy .art-img {
            transform: translate(-13px);
          }
          .toggled .art-img {
            transform: translate(0);
          }

          .body {
            grid-area: right;
          }
          .actionToggle {
            grid-area: corner;
            padding: 7px 15px 5px 5px;
            border: 0;
            background: transparent;
            color: inherit;
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'toggleClasses', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'dragHandleProps', type: PropTypes.object, val: {} },
  { name: 'artSrc', type: PropTypes.string, val: 'https://via.placeholder.com/150' },
  { name: 'busy', type: PropTypes.bool, val: false },
  { name: 'actions', type: PropTypes.object, val: {} },
  { name: 'onClick', type: PropTypes.func, val: () => {} },
  { name: 'idx', type: PropTypes.number, val: -1 },
  { name: 'playingNow', type: PropTypes.string, val: '' },
  { name: 'isPlaying', type: PropTypes.bool, val: false },
  { name: 'queueIndex', type: PropTypes.oneOfType([ PropTypes.number, PropTypes.bool ]), val: false },
  { name: 'actionsAbove', type: PropTypes.bool, val: false },
  { name: 'pending', type: PropTypes.object, val: {} }
]

Track.defaultProps = defaultProps(props)
Track.propTypes = propTypes(props)

export default Track
