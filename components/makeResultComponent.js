import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import YouTubeVideo from './YouTubeVideo'
import Action from './Action'

function makeResultComponent (opts) {
  class ResultComponent extends Component {
    constructor (props) {
      super(props)
      this.onClick = this.onClick.bind(this)
    }

    onClick (event) {
      if (opts.play) {
        opts.play(this.props.data, this.props.idx)
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
          className={classes.join(' ')}
        >
          {opts.playNext
            ? (
              <Action
                data={this.props.data}
                go={opts.playNext}
                txt='>'
                className='toUpNextButton'
              />
            ) : null}

          {opts.enqueue
            ? (
              <Action
                data={this.props.data}
                go={opts.enqueue}
                txt='⤵'
                className='enqueueButton'
              />
            ) : null}

          {opts.toggleShowPlayer
            ? (
              <Action
                data={this.props.data}
                go={opts.toggleShowPlayer}
                txt='show/hide player'
                inline={
                  <svg version='1.1'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 32 32'
                  >
                    <title>show/hide player</title>
                    <path d='M12 9c0-2.761 2.239-5 5-5s5 2.239 5 5c0 2.761-2.239 5-5 5s-5-2.239-5-5zM0 9c0-2.761 2.239-5 5-5s5 2.239 5 5c0 2.761-2.239 5-5 5s-5-2.239-5-5zM24 19v-3c0-1.1-0.9-2-2-2h-20c-1.1 0-2 0.9-2 2v10c0 1.1 0.9 2 2 2h20c1.1 0 2-0.9 2-2v-3l8 5v-14l-8 5zM20 24h-16v-6h16v6z' />
                  </svg>
                }
                className={opts.showPlayer
                  ? 'showPlayerToggle showPlayerToggle--showing'
                  : 'showPlayerToggle showPlayerToggle--hiding'}
              />
            ) : null}

          {opts.remember && opts.isInCollection
            ? (
              <Action
                data={this.props.data}
                go={opts.remember}
                txt='✔'
                className={
                  opts.isInCollection(this.props.data)
                    ? 'inCollection'
                    : 'notInCollection'
                }
              />
            ) : null}
          {opts.dismiss
            ? (
              <Action
                data={this.props.data}
                go={() => {
                  opts.dismiss(this.props.idx)
                }}
                txt='x'
              />
            ) : null}
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
