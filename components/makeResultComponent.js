import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import YouTubeVideo from './YouTubeVideo'
import Action from './Action'

function makeResultComponent (opts) {
  const options = opts
  options.actions = opts.actions || {}
  const nbActions = Object.keys(options.actions).length
  class ResultComponent extends Component {
    constructor (props) {
      super(props)
      this.onClick = this.onClick.bind(this)

      this.state = {
        showingActions: false
      }
    }

    onClick (event) {
      if (options.onClick) {
        options.onClick(this.props.data, this.props.idx)
      }
    }

    render () {
      const classes = this.props.className.split(' ')
      classes.push('actionable')

      let corner
      if (nbActions > 0) {
        if (this.state.showingActions) {
          corner = (
            <button className='invisibutton' onClick={(event) => {
              event.stopPropagation()
              this.setState({ 'showingActions': false })
            }}>
              <img src='/static/x.svg' className='icon' alt='cancel' title='cancel' />
            </button>
          )
        } else {
          corner = (
            <button className='invisibutton' onClick={(event) => {
              event.stopPropagation()
              this.setState({ 'showingActions': true })
            }}>
              <img src='/static/plus.svg' className='icon' alt='more options' title='more options' />
            </button>
          )
        }
      }
      return (
        <YouTubeVideo
          data={this.props.data}
          query={this.props.query}
          onClick={this.onClick}
          className={classes.join(' ')}
        >
          {corner}
          {
            (this.state.showingActions)
              ? (
                <ul className='actions'>
                  {Object.keys(options.actions).map((key) => {
                    const action = options.actions[key]
                    return <li key={key}>
                      <Action
                        data={this.props.data}
                        go={action.go}
                        txt={action.txt}
                        icon={action.icon}
                        idx={this.props.idx}
                      />
                    </li>
                  })}
                </ul>
              )
              : null
          }
        </YouTubeVideo>
      )
    }
  }

  const props = [
    { name: 'className', type: PropTypes.string, val: '' },
    { name: 'query', type: PropTypes.string, val: '' },
    { name: 'data', type: PropTypes.object.isRequired },
    { name: 'onClick', type: PropTypes.func, val: () => {} },
    { name: 'idx', type: PropTypes.number, val: -1 }
  ]

  ResultComponent.defaultProps = defaultProps(props)
  ResultComponent.propTypes = propTypes(props)

  return ResultComponent
}

export default makeResultComponent
