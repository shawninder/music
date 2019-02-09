import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import CopyButton from './CopyButton'
import colors from '../styles/colors'

class Header extends Component {
  render () {
    return (
      <header>
        <CopyButton
          className='copyButton'
          dict={this.props.dict}
          notify={this.props.notify}
        />
        <style jsx>{`
          header {
            text-align: center;
            margin: 5px 0;
            padding: 40px 0 0;
            h1 {
              font-size: xx-large;
              font-family: palatino;
              color: ${colors.textBg};
              cursor: text;
              margin-bottom: 0;
            }
            p {
              padding: 0 5px;
            }
          }
        `}</style>
      </header>
    )
  }
}

const props = [
  { name: 'dict', type: PropTypes.object.isRequired },
  { name: 'notify', type: PropTypes.func, val: console.log }
]

Header.defaultProps = defaultProps(props)
Header.propTypes = propTypes(props)

export default Header