import React, { Component } from 'react'

export default class StartParty extends Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.nameChange = this.nameChange.bind(this)

    this.state = {
      name: ''
    }
  }
  onClick () {
    this.props.dispatch({
      type: 'Party.start',
      data: {
        name: this.state.name
      }
    })
  }
  nameChange (event) {
    this.setState({ name: event.target.value })
  }
  render () {
    return  (
      <div>
        {this.props.data.key}
        <input type="text" placeholder="name" onChange={this.nameChange} />
        <button onClick={this.onClick}>Start</button>
      </div>
    )
  }
}
