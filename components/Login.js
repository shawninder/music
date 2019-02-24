import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

class Login extends Component {
  render () {
    return (
      <section className='login'>
        <a href='#login-coming-soon' onClick={() => {
          this.props.notify({ id: Math.random().toString(), body: this.props.dict.get('features.comingSoon'), duration: 5000 })
        }}>Login</a>
        <style jsx>{`
          .login {
            a {
            cursor: pointer;
              color: ${colors.link};
              transition-property: color;
              transition-duration: ${durations.instant};
              transition-timing-function: ${tfns.easeInOutQuad};
            }
            a:hover {
              color: ${colors.primary};
            }
          }
        `}</style>
      </section>
    )
  }
}

const props = [
  { name: 'dict', type: PropTypes.object.isRequired },
  { name: 'notify', type: PropTypes.func, val: console.log }
]

Login.defaultProps = defaultProps(props)
Login.propTypes = propTypes(props)

export default Login
