import React, { Component } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Feedback extends Component {
  constructor (props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)

    this.state = {
      body: '',
      email: '',
      submitting: false,
      submitted: false
    }
  }
  onSubmit (event) {
    event.stopPropagation()
    event.preventDefault()
    this.setState({
      submitting: true
    })
    fetch(`${process.env.API_URL}/feedback`, {
      method: 'post',
      body: JSON.stringify(this.state)
    }).then((response) => {
      if (response.ok) {
        this.setState({
          submitting: false,
          submitted: true
        })
      } else {
        this.setState({
          submitting: false,
          submitted: false
        })
        throw response
      }
    }).catch((ex) => {
      console.log('ex', ex)
    })
  }
  render () {
    let classNames = []
    let buttonTxt = 'Send'
    if (this.state.submitting) {
      classNames.push('submitting')
      buttonTxt = 'Sending'
    }
    if (this.state.submitted) {
      classNames.push('submitted')
      buttonTxt = 'Sent'
    }
    return (
      <div className='Feedback'>
        <form onSubmit={this.onSubmit} className={classNames.join(' ')}>
          <h2>
            {this.props.caption}
          </h2>
          <textarea onChange={(event) => {
            this.setState({ body: event.target.value, submitted: false })
          }} />
          <label>Your e-mail (optional)</label>
          <input type='email' placeholder='♫@♭mail♩com' onChange={(event) => {
            this.setState({ email: event.target.value, submitted: false })
          }} />
          <button type='submit'>{buttonTxt}</button>
        </form>
      </div>
    )
  }
}

const props = [
  { name: 'caption', type: PropTypes.string, val: 'Feedback' }
]

Feedback.defaultProps = defaultProps(props)
Feedback.propTypes = propTypes(props)

export default Feedback
