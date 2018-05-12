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
          {/* {
            this.state.showingActions
              ? (
            <ul className='actions'>
            {options.actions.play
            ? (
            <li>
            <Action
            data={this.props.data}
            go={options.actions.play}
            txt='Play Now'
            icon={(
            <img
            className='icon'
            src='/static/play.svg'
            alt='play now'
            title='play now'
            />
            )}
            className='toUpNextButton'
            />
            </li>
            ) : null}
            {options.actions.playNext
            ? (
            <li>
            <Action
            data={this.props.data}
            go={options.actions.playNext}
            txt='Play Next'
            icon='>'
            className='toUpNextButton'
            />
            </li>
            ) : null}

            {options.actions.enqueue
            ? (
            <li>
            <Action
            data={this.props.data}
            go={options.actions.enqueue}
            txt='Play Last'
            icon='⤵'
            className='enqueueButton'
            />
            </li>
            ) : null}
            {options.actions.remove
            ? (
            <li>
            <Action
            data={this.props.data}
            go={options.actions.remove}
            txt='Remove'
            icon={(<img className='icon' src='/static/x.svg' title='remove' alt='remove' />)}
            className='removeButton'
            />
            </li>
            ) : null}
            </ul>
              )
              : null
          } */}

          {/* {options.toggleShowPlayer
            ? (
              <Action
            data={this.props.data}
            go={options.actions.toggleShowPlayer}
            txt='show/hide player'
            icon={
            <svg version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 32 32'
            >
            <title>show/hide player</title>
            <path d='M12 9c0-2.761 2.239-5 5-5s5 2.239 5 5c0 2.761-2.239 5-5 5s-5-2.239-5-5zM0 9c0-2.761 2.239-5 5-5s5 2.239 5 5c0 2.761-2.239 5-5 5s-5-2.239-5-5zM24 19v-3c0-1.1-0.9-2-2-2h-20c-1.1 0-2 0.9-2 2v10c0 1.1 0.9 2 2 2h20c1.1 0 2-0.9 2-2v-3l8 5v-14l-8 5zM20 24h-16v-6h16v6z' />
            </svg>
            }
            className={options.showPlayer
            ? 'showPlayerToggle showPlayerToggle--showing'
            : 'showPlayerToggle showPlayerToggle--hiding'}
              />
          ) : null} */}

          {/* {options.remember && options.isInCollection
            ? (
              <Action
            data={this.props.data}
            go={options.remember}
            txt='✔'
            className={
            options.isInCollection(this.props.data)
            ? 'inCollection'
            : 'notInCollection'
            }
              />
          ) : null} */}
          {/* {options.dismiss
            ? (
              <Action
            data={this.props.data}
            go={() => {
            options.dismiss(this.props.idx)
            }}
            icon={(<img src='/static/x.svg' alt='remove' title='remove' className='remove-button icon' />)}
              />
          ) : null} */}
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
