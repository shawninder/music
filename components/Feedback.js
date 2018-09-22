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
      type: 'feature request',
      body: '',
      email: ''
    }
  }
  onSubmit (event) {
    event.stopPropagation()
    event.preventDefault()
    this.props.dispatch({
      type: 'Feedback:submitting'
    })
    fetch(`${process.env.API_URL}/feedback`, {
      method: 'post',
      body: JSON.stringify(this.state)
    }).then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        throw response
      }
    }).then((data) => {
      console.log('data', data)
    }).catch((ex) => {
      console.log('ex', ex)
    })
  }
  render () {
    return (
      <div className='Feedback'>
        <form onSubmit={this.onSubmit}>
          <select className='feedback-type' onChange={(event) => {
            this.setState({ type: event.target.value })
          }}>
            <option>feature request</option>
            <option>bug report</option>
            <option>question</option>
            <option>other</option>
          </select>
          <h2>
            {this.props.caption}
          </h2>
          <textarea onChange={(event) => {
            this.setState({ body: event.target.value })
          }} />
          <label>Your e-mail (optional)</label>
          <input type='email' placeholder='♫@♭mail♩com' onChange={(event) => {
            this.setState({ email: event.target.value })
          }} />
          <button type='submit'>Send</button>
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
