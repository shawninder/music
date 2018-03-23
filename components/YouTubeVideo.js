import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Item extends Component {
  render () {
    const classes = this.props.className.split(' ')
    classes.push('youtube-result')
    return (
      <div
        className={classes.join(' ')}
        onClick={this.props.onClick}
      >
        <img
          src={this.props.data.snippet.thumbnails.default.url}
          alt={`Thumnail for ${this.props.data.title}`}
        />
        <div className='youtube-result-info'>
          <p className='youtube-result-title'>{this.props.data.snippet.title}</p>
          <p className='youtube-result-channel'>{this.props.data.snippet.channelTitle}</p>
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
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'onClick', type: PropTypes.func, val: () => {} }
]

Item.defaultProps = defaultProps(props)
Item.propTypes = propTypes(props)

export default Item
