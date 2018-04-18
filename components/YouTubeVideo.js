import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import youtubeUrl from '../helpers/youtubeUrl'

class YouTubeVideo extends Component {
  constructor (props) {
    super(props)
    this.dragStart = this.dragStart.bind(this)
  }

  dragStart (event) {
    event.dataTransfer.setData('text/plain', youtubeUrl(this.props.data.data))
  }

  render () {
    const classes = this.props.className.split(' ')
    classes.push('youtube-result')
    return (
      <div
        className={classes.join(' ')}
        onClick={this.props.onClick}
        onDragStart={this.dragStart}
        draggable
      >
        <img
          src={this.props.data.data.snippet.thumbnails.default.url}
          alt={`Thumnail for ${this.props.data.title}`}
        />
        <div className='youtube-result-info'>
          <p className='youtube-result-title'>{this.props.data.data.snippet.title}</p>
          <p className='youtube-result-channel'>{this.props.data.data.snippet.channelTitle}</p>
        </div>
        <div className='actionable-actions'>
          {this.props.children}
        </div>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'query', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'onClick', type: PropTypes.func, val: () => {} }
]

YouTubeVideo.defaultProps = defaultProps(props)
YouTubeVideo.propTypes = propTypes(props)

export default YouTubeVideo
