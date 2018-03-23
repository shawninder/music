import React, { Component } from 'react'
import PropTypes from 'prop-types'
import trim from 'lodash.trim'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Field from './Field'
import List from './List'

class Bar extends Component {
  constructor (props) {
    super(props)
    this.keyDown = this.keyDown.bind(this)
    this.focusList = this.focusList.bind(this)
    this.dismiss = this.dismiss.bind(this)

    this.state = {
      query: ''
    }
  }

  dismiss (event) {
    this.props.dispatch({
      type: 'Bar:clear'
    })
    this.props.dispatch({
      type: 'Bar:dismiss'
    })
  }

  focus (event) {
    this.props.dispatch({
      type: 'Bar:focus'
    })
  }

  keyDown (event) {
    // TODO The following belongs in the App not the Bar
    if (event.keyCode === 32) { // space
      event.stopPropagation()
    }

    if (event.keyCode === 27) { // esc
      if (event.target === this.field) {
        if (trim(this.field.value) !== '') {
          this.dismiss(event)
          this.focus(event)
        } else {
          this.field.blur()
          event.stopPropagation()
        }
      } else {
        this.props.dispatch({
          type: 'Bar:focus'
        })
      }
    }
  }

  focusList () {
    if (this.props.items.length > 0) {
      this.list.childNodes[0].focus()
    }
  }

  render () {
    return (
      <div
        className='bar'
        onKeyDown={this.keyDown}
        ref={(el) => {
          this.el = el
          this.props.onRef('el', el)
        }}
      >
        <Field
          className='bar-field'
          autoFocus={this.props.autoFocus}
          placeholder={this.props.placeholder}
          onChange={(event) => {
            this.props.dispatch({
              type: 'Bar:suggest',
              data: event.target.value
            })
          }}
          onEnter={(event) => {
            this.props.dispatch({
              type: 'Bar:suggest',
              data: event.target.value
            })
          }}
          onDown={this.focusList}
          onRef={(el) => {
            this.field = el
            this.props.onRef('field', el)
          }}
        />
        {this.props.items.length > 0
          ? (
            <List
              className='bar-list'
              items={this.props.items}
              getComponent={this.props.getComponent}
              query={this.state.query}
              onUp={() => {
                this.props.dispatch({
                  type: 'Bar:focus'
                })
              }}
              dispatch={this.props.dispatch}
              onRef={(el) => {
                this.list = el
                this.props.onRef('list', el)
              }}
            />
          )
          : null
        }
        <button className='bar-dismiss' onClick={this.dismiss}>x</button>
      </div>
    )
  }
}

const props = [
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'onRef', type: PropTypes.func.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'items', type: PropTypes.array.isRequired },
  { name: 'getComponent', type: PropTypes.func.isRequired },
  { name: 'placeholder', type: PropTypes.string, val: '' }
]

Bar.defaultProps = defaultProps(props)

Bar.propTypes = propTypes(props)

export default Bar
