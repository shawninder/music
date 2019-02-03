import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import lengths from '../styles/lengths'
import tfns from '../styles/timing-functions'

class Links extends Component {
  render () {
    return (
      <footer>
        <ul>
          <li><a href='/terms' target='_blank'>Terms and conditions</a></li>
          <li><a href='/privacy' target='_blank'>Privacy</a></li>
        </ul>
        <style jsx>{`
          footer {
            margin-top: ${lengths.rowHeight};
            padding-bottom: ${lengths.rowHeight};
            ul {
              list-style: none;
              li {
                margin: 2px;
              }
            }
          }
          a {
            cursor: pointer;
            color: ${colors.link};
            transition-property: color;
            transition-duration: 0.1s;
            transition-timing-function: ${tfns.easeInOutQuad};
          }
          a:hover {
            color: ${colors.aqua};
          }
        `}</style>
      </footer>
    )
  }
}

const props = [
  { name: 'dict', type: PropTypes.object.isRequired },
  { name: 'notify', type: PropTypes.func, val: console.log }
]

Links.defaultProps = defaultProps(props)
Links.propTypes = propTypes(props)

export default Links
