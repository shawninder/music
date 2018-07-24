import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import YouTubeVideo from './YouTubeVideo'
import Action from './Action'

import cancelIcon from './cancelIcon'
import moreIcon from './moreIcon'

const isServer = typeof window === 'undefined'

function makeResultComponent (opts) {
  const options = opts || {}
  options.actions = options.actions || {}
  const nbActions = Object.keys(options.actions).length
  class ResultComponent extends Component {
    constructor (props) {
      super(props)
      this.globalClick = this.globalClick.bind(this)
      this.onClick = this.onClick.bind(this)
      this.onToggle = this.onToggle.bind(this)

      this.state = {
        showingActions: false
      }
      this.previousProps = props
      this.previousState = this.state
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
        this.setState({ showingActions: false })
      }
    }

    onClick (event) {
      event.stopPropagation()
      if (this.state.showingActions) {
        this.setState({
          showingActions: false
        })
      } else {
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
    }

    onToggle (event) {
      event.stopPropagation()
      if (!this.props.data.inQueue) {
        options.actions.enqueue.go(this.props.data)
      } else if (this.props.onClick) {
        this.props.onClick(event)
      } else {
        this.onClick(event)
      }
    }

    render () {
      const classes = this.props.className.split(' ')
      classes.push('actionable')

      let corner
      if (nbActions > 0) {
        if (this.state.showingActions) {
          corner = (
            <button className='corner invisibutton' onClick={(event) => {
              event.stopPropagation()
              this.setState({ 'showingActions': false })
            }}>
              {cancelIcon}
            </button>
          )
        } else {
          corner = (
            <button className='corner invisibutton' onClick={(event) => {
              event.stopPropagation()
              this.setState({ 'showingActions': true })
            }}>
              {moreIcon}
            </button>
          )
        }
      }
      return (
        <YouTubeVideo
          data={this.props.data}
          query={this.props.query}
          onClick={this.onClick}
          onToggle={this.onToggle}
          className={classes.join(' ')}
          dragHandleProps={this.props.dragHandleProps}
          key={`${classes[0]}-YouTubeVideo-${this.props.data.data.id.videoId}`}
        >
          {corner}
          {
            (this.state.showingActions)
              ? (
                <ul className='actions' ref={(ref) => {
                  this.actions = ref
                }}>
                  {Object.keys(options.actions).reduce((arr, key) => {
                    const action = options.actions[key]
                    if (!action.cdn || action.cdn(this.props.queueIndex)) {
                      arr.push(
                        <li key={key}>
                          <Action
                            data={this.props.data}
                            go={action.go}
                            txt={action.txt}
                            icon={action.icon}
                            idx={this.props.idx}
                            queueIndex={this.props.queueIndex}
                            targetIdx={action.targetIdx}
                          />
                        </li>
                      )
                    }
                    return arr
                  }, [])}
                </ul>
              )
              : null
          }
        </YouTubeVideo>
      )
    }
  }

  const props = [
    { name: 'className', type: PropTypes.string, val: '' },
    { name: 'query', type: PropTypes.string, val: '' },
    { name: 'data', type: PropTypes.object.isRequired },
    { name: 'idx', type: PropTypes.number, val: -1 },
    { name: 'dragHandleProps', type: PropTypes.object, val: {} }
  ]

  ResultComponent.defaultProps = defaultProps(props)
  ResultComponent.propTypes = propTypes(props)

  return ResultComponent
}

export default makeResultComponent
