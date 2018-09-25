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
    let buttonTxt = this.props.dict.get('feedback.submit')
    if (this.state.submitting) {
      classNames.push('submitting')
      buttonTxt = this.props.dict.get('feedback.submitting')
    }
    if (this.state.submitted) {
      classNames.push('submitted')
      buttonTxt = this.props.dict.get('feedback.submitted')
    }
    return (
      <div className='Feedback'>
        <form onSubmit={this.onSubmit} className={classNames.join(' ')}>
          <h2>
            {this.props.dict.get('feedback.caption')}
          </h2>
          <textarea onChange={(event) => {
            this.setState({ body: event.target.value, submitted: false })
          }} />
          <label>{this.props.dict.get('feedback.emailLabel')}</label>
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
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'dict', type: PropTypes.object.isRequired }
]

Feedback.defaultProps = defaultProps(props)
Feedback.propTypes = propTypes(props)

export default Feedback
