import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
// import youtubeUrl from '../helpers/youtubeUrl'

class YouTubeVideo extends Component {
  constructor (props) {
    super(props)
    // this.dragStart = this.dragStart.bind(this)
    this.artMouseDown = this.artMouseDown.bind(this)
    this.artTouchStart = this.artTouchStart.bind(this)
    this.globalMouseMove = this.globalMouseMove.bind(this)
    this.globalTouchMove = this.globalTouchMove.bind(this)
    this.globalMouseUp = this.globalMouseUp.bind(this)
    this.globalTouchEnd = this.globalTouchEnd.bind(this)
    this.initiateDrage = this.initiateDrag.bind(this)
    this.moveArt = this.moveArt.bind(this)
    this.resetGrabbed = this.resetGrabbed.bind(this)

    this.state = {
      grabbed: false,
      x: -1000,
      y: -1000
    }
  }

  // dragStart (event) {
  //   event.dataTransfer.setData('text/plain', youtubeUrl(this.props.data.data))
  // }

  artMouseDown (event) {
    this.initiateDrag()
    window.addEventListener('mousemove', this.globalMouseMove, false)
    window.addEventListener('mouseup', this.globalMouseUp, false)
  }

  artTouchStart (event) {
    console.log('TOUCH START', event)
    event.preventDefault()
    this.initiateDrag()
    window.addEventListener('touchmove', this.globalTouchMove, false)
    window.addEventListener('touchend', this.globalTouchEnd, false)
  }

  globalMouseMove (event) {
    event.preventDefault() // Otherwise, dragging imgs fails... see https://groups.google.com/forum/#!topic/mootools-users/zkKeeUicTp8
    if (event.buttons === 0) {
      window.removeEventListener('mousemove', this.globalMouseMove, false)
      window.removeEventListener('mouseup', this.globalMouseUp, false)

      if (this.state.grabbed) {
        this.resetGrabbed()
      }
    } else {
      this.moveArt(event.clientX, event.clientY)
    }
  }

  globalTouchMove (event) {
    event.preventDefault()
    if (!this.initialX || !this.initialY) {
      this.initialX = event.pageX
      this.initialY = event.pageY
    }
    console.log('TOUCH MOVE')

    const newX = this.artX + event.pageX - this.initialX
    const newY = this.artY + event.pageY - this.initialY
    this.moveArt(newX, newY)
  }

  globalMouseUp (event) {
    window.removeEventListener('mousemove', this.globalMouseMove, false)
    window.removeEventListener('mouseup', this.globalMouseUp, false)
    this.resetGrabbed()
  }

  globalTouchEnd (event) {
    console.log('TOUCH END')
    window.removeEventListener('touchmove', this.globalTouchMove, false)
    window.removeEventListener('touchend', this.globalTouchEnd, false)
    this.resetGrabbed()
  }

  initiateDrag () {
    this.setState({ grabbed: true })
    const rect = this.artEl.getBoundingClientRect()
    this.artX = rect.left
    this.artY = rect.top
  }

  moveArt (x, y) {
    this.setState({ x, y })
  }

  resetGrabbed () {
    this.setState({
      grabbed: false,
      x: -1000,
      y: -1000
    })
    this.initialX = null
    this.initialY = null
  }

  render () {
    const classes = this.props.className.split(' ')
    classes.push('youtube-result')
    const toggleClasses = ['toggle']
    if (this.props.data.inQueue) {
      toggleClasses.push('toggled')
    }
    return (
      <div
        className={classes.join(' ')}
        onClick={this.props.onClick}
      >
        <div className={toggleClasses.join(' ')} onClick={this.props.onToggle}>
          <div
            className='art'
            // onDragStart={this.dragStart}
            // draggable
          >
            <div
              className='idx'
            >
              {this.props.data.queueIndex}
            </div>
            <img
              ref={(el) => {
                this.artEl = el
              }}
              className='art-img'
              src={this.props.data.data.snippet.thumbnails.default.url}
              alt={`Thumnail for ${this.props.data.data.snippet.title}`}
              onMouseDown={this.artMouseDown}
              onTouchStart={this.artTouchStart}
            />
            <img
              className='grabbed'
              src={this.props.data.data.snippet.thumbnails.default.url}
              alt={`Thumnail for ${this.props.data.data.snippet.title}`}
              style={{
                display: this.state.grabbed ? 'block' : 'none',
                top: this.state.y,
                left: this.state.x
              }}
            />
          </div>
        </div>
        <div className='youtube-result-info'>
          <p className='youtube-result-title'>{this.props.data.data.snippet.title}</p>
          <p className='youtube-result-channel'>{this.props.data.data.snippet.channelTitle}</p>
        </div>
        {this.props.children}
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'query', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'onClick', type: PropTypes.func, val: () => {} },
  { name: 'onToggle', type: PropTypes.func, val: () => {} }
]

YouTubeVideo.defaultProps = defaultProps(props)
YouTubeVideo.propTypes = propTypes(props)

export default YouTubeVideo
