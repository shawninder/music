import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import YouTubeVideo from './YouTubeVideo'
import Action from './Action'

const isServer = typeof window === 'undefined'

// TODO Find a way to import svgs
const cancelIcon = (
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
    title='cancel'
    alt='cancel'
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

// TODO Find a way to import svgs
const moreIcon = (
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
    viewBox='0 0 4233.9999 4233.9999'
    title='more'
    alt='more'
    className='icon'
  >
    <g
      transform='translate(-2383.2373,-3674.9661)'
    >
      <path
        d='m 2625,2621 m 455,2621 c 173,0 329,69 442,183 113,113 183,269 183,441 0,173 -70,329 -183,442 -113,113 -269,183 -442,183 -172,0 -329,-70 -442,-183 -113,-113 -183,-269 -183,-442 0,-172 70,-328 183,-441 113,-114 270,-183 442,-183 m 320,305 c -82,-82 -195,-133 -320,-133 -125,0 -238,51 -320,133 -81,82 -132,195 -132,319 0,125 51,238 132,320 82,82 195,132 320,132 125,0 238,-50 320,-132 82,-82 132,-195 132,-320 0,-124 -50,-237 -132,-319'
      />
    </g>
    <g
      transform='translate(-930.04239,-3657.0847)'
    >
      <path
        d='m 2625,2621 m 455,2621 c 173,0 329,69 442,183 113,113 183,269 183,441 0,173 -70,329 -183,442 -113,113 -269,183 -442,183 -172,0 -329,-70 -442,-183 -113,-113 -183,-269 -183,-442 0,-172 70,-328 183,-441 113,-114 270,-183 442,-183 m 320,305 c -82,-82 -195,-133 -320,-133 -125,0 -238,51 -320,133 -81,82 -132,195 -132,319 0,125 51,238 132,320 82,82 195,132 320,132 125,0 238,-50 320,-132 82,-82 132,-195 132,-320 0,-124 -50,-237 -132,-319'
      />
    </g>
    <g
      transform='translate(469.33049,-3631.144)'
    >
      <path
        d='m 2625,2621 m 455,2621 c 173,0 329,69 442,183 113,113 183,269 183,441 0,173 -70,329 -183,442 -113,113 -269,183 -442,183 -172,0 -329,-70 -442,-183 -113,-113 -183,-269 -183,-442 0,-172 70,-328 183,-441 113,-114 270,-183 442,-183 m 320,305 c -82,-82 -195,-133 -320,-133 -125,0 -238,51 -320,133 -81,82 -132,195 -132,319 0,125 51,238 132,320 82,82 195,132 320,132 125,0 238,-50 320,-132 82,-82 132,-195 132,-320 0,-124 -50,-237 -132,-319'
      />
    </g>
  </svg>
)

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
