import React, { Component } from 'react'

export default class StopParty extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }
  onClick () {
    this.props.dispatch({
      type: 'Party.stop'
    })
  }
  render () {
    return  (
      <div>
        {this.props.data.key}
        <button onClick={this.onClick}>Stop</button>
      </div>
    )
  }
}
