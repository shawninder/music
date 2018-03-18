import React, { Component } from 'react'
import PropTypes from 'prop-types'
import trim from 'lodash.trim'
import { defaultProps, propTypes } from '../helpers'

import Field from './Field'
import List from './List'

class Omnibox extends Component {
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
      type: 'Omnibox:clear'
    })
    this.props.dispatch({
      type: 'Omnibox:dismiss'
    })
  }

  keyDown (event) {
    // TODO The following belongs in the App not the Omnibox
    if (event.keyCode === 32) { // space
      event.stopPropagation()
    }

    if (event.keyCode === 27) { // esc
      if (event.target === this.field) {
        if (trim(this.field.value) !== '') {
          this.dismiss(event)
        } else {
          this.field.blur()
          event.stopPropagation()
        }
      } else {
        this.props.dispatch({
          type: 'Omnibox:focus'
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
        className="omnibox"
        onKeyDown={this.keyDown}
        ref={(el) => {
          this.el = el
          this.props.onRef('el', el)
        }}
      >
        <Field
          className="omnibox-field"
          autoFocus={this.props.autoFocus}
          placeholder={this.props.placeholder}
          onChange={(event) => { this.props.dispatch({
              type: 'Omnibox:suggest',
              data: event.target.value
            })
          }}
          onEnter={(event) => { this.props.dispatch({
            type: 'Omnibox:suggest',
            data: event.target.value
          }) }}
          onDown={this.focusList}
          onRef={(el) => {
            this.field = el
            this.props.onRef('field', el)
          }}
        />
        {this.props.items.length > 0
          ? (
            <List
              className="omnibox-list"
              items={this.props.items}
              getComponent={this.props.getComponent}
              query={this.state.query}
              onUp={() => {
                this.props.dispatch({
                  type: 'Omnibox:focus'
                })
              }}
              dispatch={this.props.dispatch}
              onRef={(el) => {
                this.list = el
                this.props.onRef('list', el)
              }}
            >
            </List>
          )
          : null
        }
        <button className="omnibox-dismiss" onClick={this.dismiss}>x</button>
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

Omnibox.defaultProps = defaultProps(props)

Omnibox.propTypes = propTypes(props)

export default Omnibox
