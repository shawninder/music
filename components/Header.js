import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import MusicFont from './musicFont'
import CopyButton from './CopyButton'
import colors from '../styles/colors'

class Header extends Component {
  render () {
    return (
      <header>
        <h1><MusicFont>Crowd's Play</MusicFont></h1>
        <p>{this.props.dict.get('header.tagline')}</p>
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
              font-family: fantasy;
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
