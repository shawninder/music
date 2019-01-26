import React, { Component } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'

class Feedback extends Component {
  constructor (props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)

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
        this.props.notify({
          id: Math.random().toString().slice(2),
          body: this.props.dict.get('feedback.submitted'),
          duration: 3000
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
  onKeyDown (event) {
    event.stopPropagation()
    if (event.keyCode === 13 && event.metaKey && !event.ctrlKey && !event.shiftKey) { // cmd+enter
      const form = event.target.parentNode
      const button = form.querySelector('button[type=submit]')
      button.focus()
      button.click()
    }
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
      buttonTxt = this.props.dict.get('feedback.submittedShort')
    }
    return (
      <div className='Feedback'>
        <form onSubmit={this.onSubmit} className={classNames.join(' ')}>
          <h2>
            {this.props.dict.get('feedback.caption')}
          </h2>
          <textarea
            onChange={(event) => {
              this.setState({ body: event.target.value, submitted: false })
            }}
            onKeyDown={this.onKeyDown}
          />
          <label>{this.props.dict.get('feedback.emailLabel')}</label>
          <input type='email' placeholder='♫@♭mail♩com' onChange={(event) => {
            this.setState({ email: event.target.value, submitted: false })
          }} />
          <button type='submit'>{buttonTxt}</button>
        </form>
        <style jsx>{`
          .Feedback {
            margin-top: 50px;
            text-align: center;
            form {
              padding: 10px;
              max-width: 640px;
              margin: 0 auto;
              text-align: left;
              line-height: 1.5em;
              color: ${colors.whitesmoke};
              text-shadow: 0 0 30px black;
            }
            h2 {
              font-size: x-large;
            }
            p {
              margin: 10px;
            }
            textarea {
              margin: 10px 0;
              width: 100%;
              height: 7em;
            }
            [type=email] {
            }
            label {
              margin-right: 10px;
            }
            [type=submit] {
              float: right;
              border-color: ${colors.aqua};
              background: ${colors.aqua};
            }
            .submitting [type=submit], .submitted [type=submit] {
              color: ${colors.white};
              background: rgba(200, 200, 200, 20%);
              border-color: rgba(200, 200, 200, 20%);
            }
          }
        `}</style>
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
