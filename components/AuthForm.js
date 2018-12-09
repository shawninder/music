import { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class AuthForm extends Component {
  constructor (props) {
    super(props)
    this.usernameChanged = this.usernameChanged.bind(this)
    this.passwordChanged = this.passwordChanged.bind(this)
  }
  usernameChanged (event) {
    const action = {
      type: 'Auth:setUsername',
      value: event.target.value
    }
    this.props.dispatch(action)
  }

  passwordChanged (event) {
    this.props.dispatch({
      type: 'Auth:setPassword',
      value: event.target.value
    })
  }
  render () {
    return (
      <form className='authForm'>
        <label>Username: </label>
        <input type='text' onChange={this.usernameChanged} />
        <label>Password: </label>
        <input type='password' onChange={this.passwordChanged} />
        <style jsx>{`
          .authForm {
            float: right;
          }

          .authForm label {
            margin-left: 10px;
          }
        `}</style>
      </form>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

AuthForm.defaultProps = defaultProps(props)
AuthForm.propTypes = propTypes(props)

export default AuthForm
