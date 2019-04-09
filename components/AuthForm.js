import React from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

function AuthForm (props) {
  function usernameChanged (event) {
    const action = {
      type: 'Auth:setUsername',
      value: event.target.value
    }
    props.dispatch(action)
  }

  function passwordChanged (event) {
    props.dispatch({
      type: 'Auth:setPassword',
      value: event.target.value
    })
  }
  return (
    <form className='authForm'>
      <label>Username: </label>
      <input type='text' onChange={usernameChanged} />
      <label>Password: </label>
      <input type='password' onChange={passwordChanged} />
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

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

AuthForm.defaultProps = defaultProps(props)
AuthForm.propTypes = propTypes(props)

export default AuthForm
