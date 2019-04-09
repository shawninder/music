import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import lengths from '../styles/lengths'
import colors from '../styles/colors'
import alpha from '../helpers/alpha'

function TrackButton (props) {
  const Icon = props.icon
  return (
    <figure onClick={props.onClick} className='trackButton'>
      <Icon className='icon' />
      <figcaption className='caption'>{props.caption}</figcaption>
      <style jsx>{`
        .trackButton {
          width: 100%;
          border: 1px solid ${colors.text};
          background: ${alpha(colors.text, 1 - colors.opacity)};
          cursor: pointer;
          display: grid;
          grid-template-columns: ${lengths.toggleWidth} 1fr;
          grid-template-rows: ${lengths.toggleHeight};
          grid-template-areas:
            "tb-icon tb-caption";

          .icon {
            background: ${alpha(colors.textBg, colors.opacity)};
            grid-area: tb-icon;
            padding: 5px;
            width: 100%;
            height: 100%;
            max-height: ${lengths.toggleHeight};
            max-width: ${lengths.toggleWidth};
          }
          .caption {
            grid-area: tb-caption;
            padding: 20px 10px 5px;
            font-weight: bold;
          }
          &:hover {
            color: ${colors.primary};
            border-color: ${colors.primary};
            .icon {
              background: ${alpha(colors.text, 1 - colors.opacity)};
            }
          }
        }
      `}</style>
    </figure>
  )
}

const props = [
  { name: 'caption', type: PropTypes.string.isRequired },
  { name: 'onClick', type: PropTypes.func, val: () => {} }
]

TrackButton.defaultProps = defaultProps(props)
TrackButton.propTypes = propTypes(props)

export default TrackButton
