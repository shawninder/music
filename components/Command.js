import React, { Component } from 'react'

import highlighted from '../helpers/highlighted'

class Command extends Component {
  render () {
    return (
      <div className='command' key={this.props.data.key} onClick={(event) => {
        event.stopPropagation()
        return this.props.data.go(this.props.data)
      }}>
        {highlighted(this.props.data.key, this.props.data.matches)}
        <style jsx>{`
          .command {
            padding: 12px;
            line-height: 150%;
            cursor: pointer;
            font-size: large;
            border: 0;
          }
        `}</style>
      </div>
    )
  }
}

export default Command
