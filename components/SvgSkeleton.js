import { Component } from 'react'
import PropTypes from 'prop-types'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class SvgSkeleton extends Component {
  render () {
    return (
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
        viewBox={this.props.viewBox}
        className={this.props.className}
      >
        {this.props.children}
      </svg>
    )
  }
}

const props = [
  { name: 'viewBox', type: PropTypes.string.isRequired },
  { name: 'className', type: PropTypes.string, val: '' }
]

SvgSkeleton.defaultProps = defaultProps(props)
SvgSkeleton.propTypes = propTypes(props)

export default SvgSkeleton
