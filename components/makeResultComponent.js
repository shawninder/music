import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import YouTubeVideo from './YouTubeVideo'
import Action from './Action'

function makeResultComponent (opts) {
  const options = opts
  options.actions = opts.actions || {}
  class ResultComponent extends Component {
    constructor (props) {
      super(props)
      this.onClick = this.onClick.bind(this)
      this.onToggle = this.onToggle.bind(this)

      this.state = {
        showingActions: false
      }
      this.previousProps = props
      this.previousState = this.state
    }

    onClick (event) {
      event.stopPropagation()
      if (this.state.showingActions) {
        this.setState({
          showingActions: false
        })
      } else {
        this.setState({
          showingActions: true
        })
        setTimeout(() => {
          if (this.actions) {
            const li = this.actions.childNodes[0]
            if (li) {
              li.childNodes[0].focus()
            }
          }
        }, 0)
      }
    }

    onToggle (event) {
      event.stopPropagation()
      if (!this.props.data.inQueue) {
        options.actions.enqueue.go(this.props.data)
      } else {
        this.onClick(event)
      }
    }

    render () {
      const classes = this.props.className.split(' ')
      classes.push('actionable')

      return (
        <YouTubeVideo
          data={this.props.data}
          query={this.props.query}
          onClick={this.onClick}
          onToggle={this.onToggle}
          className={classes.join(' ')}
        >
          {
            (this.state.showingActions)
              ? (
                <ul className='actions' ref={(ref) => {
                  this.actions = ref
                }}>
                  {Object.keys(options.actions).map((key) => {
                    const action = options.actions[key]
                    return <li key={key}>
                      <Action
                        data={this.props.data}
                        go={action.go}
                        txt={action.txt}
                        icon={action.icon}
                        idx={this.props.idx}
                        targetIdx={action.targetIdx}
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
