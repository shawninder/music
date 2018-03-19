import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { defaultProps, propTypes } from '../helpers'

class Party extends Component {
  constructor (props) {
    super(props)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.party = this.party.bind(this)
    this.leave = this.leave.bind(this)
    this.stop = this.stop.bind(this)

    this.state = {
      name: props.defaultValue
    }
  }
  party (event) {
    this.props.dispatch({
      type: 'Party.auto',
      data: {
        name: this.state.name
      }
    })
  }
  stop (event) {
    this.props.dispatch({
      type: 'Party.stop'
    })
  }
  leave (event) {
    this.props.dispatch({
      type: 'Party.leave'
    })
  }
  onChange (event) {
    this.setState({ name: event.target.value })
  }
  onKeyDown (event) {
    if (event.keyCode === 13) { // enter
      event.preventDefault()
      this.party(event)
    }
  }
  onSubmit (event) {
    event.preventDefault()
  }
  render () {
    const attending = !!this.props.attending.name
    const transmitting = !!this.props.transmitting.name
    const partying = attending || transmitting
    const input = !partying
      ? (
        <input
          type="text"
          placeholder={this.props.placeholder}
          autoFocus={this.props.autoFocus}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          defaultValue={this.state.name}
        />
      )
      : (
        <input
          className="disabled"
          type="text"
          defaultValue={this.props.attending.name || this.props.transmitting.name}
          disabled
        />
      )
    const button = !partying
      ? (
        <button onClick={this.party}>{this.props.dict.get('party.go')}</button>
      )
      : (
        <button onClick={attending ? this.leave : this.stop}>{attending ? this.props.dict.get('party.leave') : this.props.dict.get('party.end')}</button>
      )
    return (
      <div className={this.props.className}>
        <h1>{this.props.dict.get('party.h1')}</h1>
        {
          (!attending && !transmitting)
            ? (
              <p>{this.props.dict.get('party.p')}</p>
            )
            : null
        }
        {
          attending
            ? (
              <p>{this.props.dict.get('party.attending')}<span className="attendedPartyName">{this.props.attending.name}</span></p>
            )
            : null
        }
        {
          transmitting
            ? (
              <p>{this.props.dict.get('party.hosting')}<span className="hostedPartyName">{this.props.transmitting.name}</span></p>
            )
            : null
        }
        <form onSubmit={this.onSubmit}>
          {input}
          {button}
        </form>
      </div>
    )
  }
}

const props = [
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'placeholder', type: PropTypes.string, val: '' },
  { name: 'defaultValue', type: PropTypes.string, val: '' },
  { name: 'attending', type: PropTypes.object.isRequired },
  { name: 'transmitting', type: PropTypes.object.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

Party.defaultProps = defaultProps(props)
Party.propTypes = propTypes(props)

export default Party
