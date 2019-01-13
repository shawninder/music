import 'core-js/es6/string.js' // for startsWith

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import deepEqual from 'deep-equal'
import trim from 'lodash.trim'
import debounce from 'lodash.debounce'
import { filter, match, score } from 'fuzzaldrin'

import Field from './Field'
import List from './List'

import searchIcon from './icons/search'
import clearIcon from './icons/clear'

const isServer = typeof window === 'undefined'

class Bar extends Component {
  constructor (props) {
    super(props)
    this.globalClick = this.globalClick.bind(this)
    this.clickOutside = this.clickOutside.bind(this)
    this.keyDown = this.keyDown.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onEnter = this.onEnter.bind(this)
    this.focusList = this.focusList.bind(this)
    this.dismiss = this.dismiss.bind(this)
    this.cede = this.cede.bind(this)
    this.clear = this.clear.bind(this)
    this.menuClicked = this.menuClicked.bind(this)
    this.query = this.query.bind(this)
    this.debouncedQuery = debounce(this.query, 500, { maxWait: 750 })

    this.previousItems = {}
    this.previousPending = {}
    this.previousComponentProps = {}
  }

  componentDidMount () {
    if (this.props.autoDismiss) {
      if (!isServer) {
        global.addEventListener('click', this.globalClick, false)
      }
    }
  }

  componentWillUnmount () {
    if (this.props.autoDismiss) {
      if (!isServer) {
        global.removeEventListener('click', this.globalClick, false)
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!deepEqual(this.previousItems, nextProps.items) ||
      !deepEqual(this.previousComponentProps, nextProps.componentProps)
    ) {
      this.previousItems = nextProps.items
      this.previousComponentProps = nextProps.componentProps
      return true
    }
    return false
  }

  globalClick (event) {
    if (this.list) {
      const idx = Array.prototype.indexOf.call(this.list.childNodes, event.target)
      if (idx === -1 && !event.defaultPrevented) { // not found
        this.clickOutside(event)
      }
    }
  }

  clickOutside (event) {
    this.dismiss()
  }

  onChange (event) {
    const value = event.target.value
    this.props.dispatch({
      type: 'Bar:setQuery',
      data: value
    })
    this.suggest(value)
  }

  onEnter (event) {
    this.query(event.target.value)
  }

  suggest (value) {
    const val = trim(value)
    if (val === '') {
      this.debouncedQuery.cancel()
      this.dismiss()
    } else {
      if (val.startsWith('/')) {
        const commandName = val.slice(1)
        const relevant = filter(Object.keys(this.props.commands), commandName)
        const items = relevant.map((label) => {
          const matches = match(label, commandName)
          const scored = score(label, commandName)
          const command = this.props.commands[label]

          const item = {
            key: label,
            type: 'command',
            matches,
            scored,
            Component: this.props.commands.Component || makeDefaultCommandComponent({
              go: command
            })
          }
          return item
        })
        // order by score
        this.props.dispatch({
          type: 'Bar:setItems',
          data: items,
          areCommands: true
        })
      } else {
        this.debouncedQuery(value)
      }
    }
  }

  query (query) {
    this.props.suggest(query)
      .then(({ items, hasMore, prevPageToken, nextPageToken }) => {
        if (this.props.query === query) {
          this.props.dispatch({
            type: 'Bar:setItems',
            data: items,
            hasMore,
            nextPageToken,
            areCommands: false
          })
        }
      })
  }

  clear () {
    this.props.dispatch({
      type: 'Bar:setQuery',
      data: ''
    })
    this.field.value = ''
  }

  dismiss () {
    this.props.dispatch({
      type: 'Bar:setItems',
      data: [],
      hasMore: false,
      nextPageToken: null
    })
  }

  focus () {
    this.field.focus()
  }

  cede (event) {
    this.field.blur()
  }

  keyDown (event) {
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      event.stopPropagation()
      if (event.target === this.field) {
        if (trim(this.field.value) !== '') {
          this.clear()
          this.dismiss()
          this.focus()
        } else {
          this.cede()
        }
      } else {
        this.dismiss()
        this.focus()
      }
    }
  }

  focusList () {
    if (this.props.items.length > 0) {
      this.list.childNodes[0].focus()
    }
  }

  menuClicked () {
    this.props.dispatch({
      type: 'App:MenuClicked'
    })
  }

  render () {
    return (
      <div
        className='bar'
        onKeyDown={this.keyDown}
        ref={(el) => {
          this.el = el
        }}
      >
        <button className='bar-menu' onClick={this.menuClicked}
        >
          {searchIcon}
        </button>
        <Field
          className='bar-field'
          autoFocus={this.props.autoFocus}
          placeholder={this.props.placeholder}
          onChange={this.onChange}
          onEnter={this.onEnter}
          onDown={this.focusList}
          onRef={(el) => {
            this.field = el
            this.props.onRef(el)
          }}
        />
        {this.props.items.length > 0
          ? (
            <List
              className='bar-list'
              items={this.props.items}
              query={this.props.query}
              onUp={() => {
                this.focus()
              }}
              onItem={this.props.onResult}
              onRef={(el) => {
                this.list = el
              }}
              defaultComponent={this.props.ResultComponent}
              isDropDisabled
              areDraggable={this.props.areCommands !== true}
              loadsMore={this.props.areCommands !== true}
              loadMore={this.props.loadMore}
              hasMore={this.props.hasMore}
              loadingTxt={this.props.loadingTxt}
              maxReachedTxt={this.props.maxReachedTxt}
              componentProps={this.props.componentProps}
            />
          )
          : null
        }
        {
          this.props.query
            ? (
              <button className='bar-dismiss' onClick={(event) => {
                if (this.props.items.length === 0) {
                  this.clear()
                } else {
                  this.dismiss()
                }
              }}>{clearIcon}</button>
            ) : null
        }
        <style jsx>{`
          button {
            border: 0;
            background: transparent;
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'placeholder', type: PropTypes.string, val: '' },
  { name: 'query', type: PropTypes.string.isRequired },
  { name: 'items', type: PropTypes.array.isRequired },
  { name: 'hasMore', type: PropTypes.bool, val: false },
  { name: 'loadMore', type: PropTypes.func, val: () => {} },
  { name: 'areCommands', type: PropTypes.bool, val: true },
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'suggest', type: PropTypes.func.isRequired },
  { name: 'componentProps', type: PropTypes.object, val: {} },
  { name: 'ResultComponent', type: PropTypes.any.isRequired },
  { name: 'onResult', type: PropTypes.object, val: {} },
  { name: 'commands', type: PropTypes.object, val: {} },
  { name: 'filters', type: PropTypes.object, val: {} },
  { name: 'onRef', type: PropTypes.func, val: () => {} },
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'decorateItem', type: PropTypes.func, val: (item) => item },
  { name: 'loadingTxt', type: PropTypes.string, val: 'Loading...' },
  { name: 'maxReachedTxt', type: PropTypes.string, val: 'Max Reached' },
  { name: 'autoDismiss', type: PropTypes.bool, val: true }
]

Bar.defaultProps = defaultProps(props)

Bar.propTypes = propTypes(props)

export default Bar

function highlight (str, matches) {
  const spans = []
  var len = matches.length

  let first = matches[0]
  if (first !== 0) {
    // First match is not the first character
    // Push non-matching leading characters
    spans.push({
      text: str.slice(0, first),
      match: false
    })
  }
  for (var i = 0; i < len; i += 1) {
    let curr = matches[i]
    let prev = matches[i - 1]
    let delta = curr - prev
    if (delta > 1) {
      // There is at least 1 character between the previous match and current one
      // Push non-matching characters between previous and current matches
      spans.push({
        text: str.substring(prev + 1, curr)
      })
    }

    // Push the current match
    spans.push({
      text: str.substr(curr, 1),
      match: true
    })
  }
  if (matches[len - 1] < str.length - 1) {
    // last match is not on last character
    // Push the remaining non-matching characters
    spans.push({
      text: str.substring(matches[len - 1] + 1)
    })
  }
  return spans
}

function highlighted (key, matches) {
  return highlight(key, matches).map((span, idx) => {
    return <span key={`${key}:${idx}`} className={span.match ? 'fuzz--match' : 'fuzz--no-match'}>{span.text}</span>
  })
}

function makeDefaultCommandComponent (opts) {
  class DefaultCommandComponent extends Component {
    render () {
      return (
        <div className='command' key={this.props.data.key} onClick={(event) => {
          event.stopPropagation()
          return opts.go(this.props.data)
        }}>
          {highlighted(this.props.data.key, this.props.data.matches)}
        </div>
      )
    }
  }
  return DefaultCommandComponent
}
