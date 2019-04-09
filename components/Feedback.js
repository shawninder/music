import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import DictContext from '../features/dict/context'
import NoticeContext from '../features/notice/context'

import colors from '../styles/colors'

function Feedback (props) {
  const { dict } = useContext(DictContext)
  const { notify } = useContext(NoticeContext)
  const [body, setBody] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function onSubmit (event) {
    event.stopPropagation()
    event.preventDefault()
    setSubmitting(true)
    fetch(`${process.env.API_URL}/feedback`, {
      method: 'post',
      body: JSON.stringify({ body, email })
    }).then((response) => {
      if (response.ok) {
        setSubmitting(false)
        setSubmitted(true)

        notify({
          id: Math.random().toString().slice(2),
          body: dict.get('feedback.submitted'),
          duration: 3000
        })
      } else {
        setSubmitting(false)
        setSubmitted(false)
        throw response
      }
    }).catch((ex) => {
      console.log('ex', ex)
    })
  }
  function onKeyDown (event) {
    event.stopPropagation()
    if (event.keyCode === 13 && event.metaKey && !event.ctrlKey && !event.shiftKey) { // cmd+enter
      const form = event.target.parentNode
      const button = form.querySelector('button[type=submit]')
      button.focus()
      button.click()
    }
  }
  let classNames = []
  let buttonTxt = dict.get('feedback.submit')
  if (submitting) {
    classNames.push('submitting')
    buttonTxt = dict.get('feedback.submitting')
  }
  if (submitted) {
    classNames.push('submitted')
    buttonTxt = dict.get('feedback.submittedShort')
  }
  return (
    <div className='Feedback'>
      <form onSubmit={onSubmit} className={classNames.join(' ')}>
        <h2>
          {dict.get('feedback.caption')}
        </h2>
        <textarea
          onChange={(event) => {
            setBody(event.target.value)
            setSubmitted(false)
          }}
          onKeyDown={onKeyDown}
        />
        <label>{dict.get('feedback.emailLabel')}</label>
        <input type='email' placeholder='♫@♭mail♩com' onChange={(event) => {
          setEmail(event.target.value)
          setSubmitted(false)
        }} />
        <button type='submit'>{buttonTxt}</button>
      </form>
      <style jsx>{`
        .Feedback {
          text-align: center;
          form {
            padding: 10px;
            max-width: 640px;
            margin: 0 auto;
            text-align: left;
            line-height: 1.5em;
            color: ${colors.textBg};
            text-shadow: 0 0 3px ${colors.text};
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
            padding: 5px;
            border-radius: 5px;
            color: ${colors.primaryText};
            border-color: ${colors.primaryText};
            background: ${colors.primaryBg};
          }
          .submitting [type=submit], .submitted [type=submit] {
            color: ${colors.textBg};
            background: rgba(200, 200, 200, 20%);
            border-color: rgba(200, 200, 200, 20%);
          }
        }
      `}</style>
    </div>
  )
}

const props = []

Feedback.defaultProps = defaultProps(props)
Feedback.propTypes = propTypes(props)

export default Feedback
