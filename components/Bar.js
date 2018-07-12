import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import trim from 'lodash.trim'
import debounce from 'lodash.debounce'
import { filter, match, score } from 'fuzzaldrin'

import Field from './Field'
import List from './List'

const isServer = typeof window === 'undefined'

// TODO Find a way to import svgs
const searchIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    version='1.1'
    style={{
      clipRule: 'evenodd',
      fillRule: 'evenodd',
      imageRendering: 'optimizeQuality',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision'
    }}
    viewBox='0 0 41.495709 41.495709'
    title='search'
    alt='search'
    className='icon'
  >
    <path
      d='M 14.367,1.7e-4 C 6.4538,1.7e-4 0,6.45417 0,14.36717 c 0,7.9132 6.454,14.367 14.367,14.367 3.2414,0 6.2283,-1.0954 8.6367,-2.918 a 2.0002,2.0002 0 0 0 0.15039,0.16602 l 14.898,14.898 a 2.0002,2.0002 0 1 0 2.8281,-2.8281 l -14.898,-14.898 A 2.0002,2.0002 0 0 0 25.81617,23.0037 c 1.8225,-2.4084 2.918,-5.3953 2.918,-8.6367 C 28.73417,6.4538 22.28017,0 14.36717,0 Z m 0,3.5898 c 5.9732,0 10.777,4.8042 10.777,10.777 0,5.9732 -4.8042,10.777 -10.777,10.777 -5.9728,0 -10.777,-4.8042 -10.777,-10.777 2e-7,-5.9732 4.8042,-10.777 10.777,-10.777 z'
    />
  </svg>
)

// TODO Find a way to import svgs
const clearIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    version='1.1'
    style={{
      clipRule: 'evenodd',
      fillRule: 'evenodd',
      imageRendering: 'optimizeQuality',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision'
    }}
    viewBox='0 0 2060.5001 2060.5001'
  >
    <g
      transform='translate(-3541.75,-3541.75)'
    >
      <path
        d='m 3568,3692 c -35,-34 -35,-90 0,-124 34,-35 90,-35 124,0 l 880,879 880,-879 c 34,-35 90,-35 124,0 35,34 35,90 0,124 l -879,880 879,880 c 35,34 35,90 0,124 -34,35 -90,35 -124,0 l -880,-879 -880,879 c -34,35 -90,35 -124,0 -35,-34 -35,-90 0,-124 l 879,-880 z'
      />
    </g>
  </svg>
)

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
          const data = items.map((item) => {
            const id = item.id.videoId
            const obj = {
              type: 'YouTubeVideo',
              key: `${id}`,
              data: item
            }
            return this.props.decorateItem(obj)
          })
          this.props.dispatch({
            type: 'Bar:setItems',
            data,
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
    console.log('menu clicked')
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
        <button className='bar-menu invisibutton' onClick={this.menuClicked}
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
              loadMore={this.props.loadMore}
              hasMore={this.props.hasMore}
            />
          )
          : null
        }
        {
          this.props.query
            ? (
              <button className='bar-dismiss invisibutton' onClick={(event) => {
                if (this.props.items.length === 0) {
                  this.clear()
                } else {
                  this.dismiss()
                }
              }}>{clearIcon}</button>
            ) : null
        }

      </div>
    )
  }
}

const props = [
  { name: 'placeholder', type: PropTypes.string, val: '' },
  { name: 'query', type: PropTypes.string.isRequired },
  { name: 'items', type: PropTypes.array.isRequired },
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'onRef', type: PropTypes.func, val: () => {} },
  { name: 'autoDismiss', type: PropTypes.bool, val: true },
  { name: 'onResult', type: PropTypes.object, val: {} },
  { name: 'areCommands', type: PropTypes.bool, val: true },
  { name: 'hasMore', type: PropTypes.bool, val: false },
  { name: 'loadMore', type: PropTypes.func, val: () => { console.log('loadMore doing nothing') } }
]

Bar.defaultProps = defaultProps(props)

Bar.propTypes = propTypes(props)

export default Bar
