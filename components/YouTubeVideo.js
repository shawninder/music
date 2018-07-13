import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
// import youtubeUrl from '../helpers/youtubeUrl'

class YouTubeVideo extends Component {
  // constructor (props) {
  //   super(props)
  //   this.dragStart = this.dragStart.bind(this)
  // }

  // dragStart (event) {
  //   event.dataTransfer.setData('text/plain', youtubeUrl(this.props.data.data))
  // }

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
        key={`${classes[0]}-YouTUbeVideo-div-${this.props.data.data.id.videoId}`}
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
              /* TODO alt={} */
              {...this.props.dragHandleProps}
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
  { name: 'onToggle', type: PropTypes.func, val: () => {} },
  { name: 'dragHandleProps', type: PropTypes.object, val: {} }
]

YouTubeVideo.defaultProps = defaultProps(props)
YouTubeVideo.propTypes = propTypes(props)

export default YouTubeVideo
