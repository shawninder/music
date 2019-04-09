import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../../helpers/defaultProps'
import propTypes from '../../helpers/propTypes'

import Happy from './Happy'
import Sad from './Sad'

import colors from '../../styles/colors'

function Spotlight (props) {
  const factor = props.variant === 'clean'
    ? 1.2
    : 1.4
  const commonProps = {
    width: `${props.size / factor}px`,
    height: `${props.size / factor}px`
  }

  const figureProps = {
    position: 'relative',
    color: colors.text,
    zIndex: 2,
    transform: props.variant === 'clean'
      ? 'translate(5%, 0)'
      : 'translate(-10%, 15%)'
  }

  const shadowProps = {
    filter: 'blur(5px)',
    color: colors.shadow,
    position: 'absolute',
    left: '10%',
    top: '10%',
    zIndex: 1,
    transform: 'skew(-15deg, 20deg) translate(25%, 15%)'
  }

  return (
    <div className='spotlight' key='spotlight'>
      <style jsx>{`
        .spotlight {
          position: relative;
          display: ${props.display};
          background: ${colors.spotlight};
          width: ${props.size}px;
          height: ${props.size}px;
          border-radius: ${props.size}px;
          padding: ${props.size / 20}px;
          margin: 0 ${props.display === 'inline-block' ? '5px' : 'auto'};
        }
      `}</style>
      <Happy key='figure' style={{ ...commonProps, ...figureProps }} />
      {props.variant === 'clean' && null}
      {props.variant === 'surprised' && <Sad key='figure-shadow' style={{ ...commonProps, ...shadowProps }} />}
      {props.variant === 'none' && <Happy key='figure-shadow' style={{ ...commonProps, ...shadowProps }} />}
    </div>
  )
}

const props = [
  { name: 'variant', type: PropTypes.string, val: 'none' },
  { name: 'size', type: PropTypes.number, val: 205 },
  { name: 'display', type: PropTypes.string, val: 'block' }
]

Spotlight.defaultProps = defaultProps(props)
Spotlight.propTypes = propTypes(props)

export default Spotlight
