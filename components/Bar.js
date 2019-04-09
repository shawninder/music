import React, { useRef, useMemo, useContext, useEffect } from 'react'

import { filter, match, score } from 'fuzzaldrin'
import trim from 'lodash.trim'
import debounce from 'lodash.debounce'

import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Field from './Field'
import List from './List'
import Command from './Command'

import searchIcon from './icons/search'
import clearIcon from './icons/clear'

import lengths from '../styles/lengths'
import colors from '../styles/colors'
import durations from '../styles/durations'

import AppContext from '../features/app/context'
import BarContext from '../features/bar/context'

import passiveSupported from '../helpers/passiveSupported'

const listenerOptions = passiveSupported ? { passive: true, capture: false } : false

function Bar (props) {
  const debouncedGo = useRef(debounce(go, 500, { maxWait: 750 }))
  const { dispatch: appDispatch } = useContext(AppContext)
  const { state: barState, dispatch: barDispatch } = useContext(BarContext)
  const list = useRef(null)

  const isServer = typeof window === 'undefined'

  useEffect(() => {
    if (props.autoDismiss) {
      if (!isServer) {
        global.addEventListener('click', globalClick, listenerOptions)
      }
    }
    return () => {
      if (props.autoDismiss) {
        if (!isServer) {
          global.removeEventListener('click', globalClick, listenerOptions)
        }
      }
    }
  })

  function globalClick (event) {
    if (list.current) {
      if (!list.current.contains(event.target) && !event.defaultPrevented) {
        clickOutside(event)
      }
    }
  }

  function clickOutside (event) {
    dismiss()
  }

  function onChange (event) {
    const value = event.target.value
    barDispatch({
      type: 'Bar:setQuery',
      data: value
    })
    suggest(value)
  }

  function onEnter (event) {
    go(event.target.value)
  }

  function suggest (value) {
    const val = trim(value)
    if (val === '') {
      debouncedGo.current.cancel()
      dismiss()
    } else {
      if (val.startsWith('/')) {
        const commandName = val.slice(1)
        const relevant = filter(Object.keys(props.commands), commandName)
        const data = relevant.map((label) => {
          const matches = match(label, commandName)
          const scored = score(label, commandName)
          const command = props.commands[label]

          const item = {
            key: label,
            type: 'command',
            matches,
            scored,
            go: command,
            Component: props.commands.Component || Command
          }
          return item
        })
        // order by score
        barDispatch({
          type: 'Bar:setItems',
          items: [],
          commands: data
        })
      } else {
        debouncedGo.current(value)
      }
    }
  }

  function go (query) {
    props.go(query)
      .then(({ items, hasMore, prevPageToken, nextPageToken }) => {
        console.log(`Setting items for "${query}"`, Date.now())
        barDispatch({
          type: 'Bar:setItems',
          items,
          hasMore,
          nextPageToken
        })
      })
  }

  function clear () {
    barDispatch({
      type: 'Bar:setQuery',
      data: ''
    })
    props.onRef.current.value = ''
  }

  function dismiss () {
    barDispatch({
      type: 'Bar:setItems',
      items: [],
      hasMore: false,
      nextPageToken: null
    })
  }

  function focus () {
    props.onRef.current.focus()
  }

  function cede (event) {
    props.onRef.current.blur()
  }

  function keyDown (event) {
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      event.stopPropagation()
      if (event.target === props.onRef.current) {
        if (trim(props.onRef.current.value) !== '') {
          clear()
          dismiss()
          focus()
        } else {
          cede()
        }
      } else {
        dismiss()
        focus()
      }
    }
  }

  function focusList () {
    if (barState.items.length > 0 || barState.commands.length > 0) {
      console.log('list.current.childNodes[0]', list.current.childNodes[0])
      list.current.childNodes[0].focus()
    }
  }

  function menuClicked () {
    appDispatch({
      type: 'App:MenuClicked'
    })
  }

  return useMemo(() => (
    <div
      className='bar'
      onKeyDown={keyDown}
    >
      <button className='bar-menu' onClick={menuClicked}
      >
        {searchIcon}
      </button>
      <Field
        className='bar-field'
        autoFocus={props.autoFocus}
        placeholder={props.placeholder}
        onFocus={props.onFocus}
        onChange={onChange}
        onEnter={onEnter}
        onDown={focusList}
        onRef={props.onRef}
      />
      {barState.items.length > 0
        ? (
          <List
            className='bar-list'
            items={barState.items.map(props.decorateItem)}
            query={props.query}
            onUp={() => {
              focus()
            }}
            onItem={props.onResult}
            onRef={list}
            defaultComponent={props.ResultComponent}
            isDropDisabled
            areDraggable={barState.commands.length === 0}
            loadsMore={barState.commands.length === 0}
            loadMore={props.loadMore}
            hasMore={props.hasMore}
            loadingTxt={props.loadingTxt}
            maxReachedTxt={props.maxReachedTxt}
            componentProps={props.componentProps}
          />
        ) : null
      }
      {barState.commands.length > 0
        ? (
          <List
            className='bar-list'
            items={barState.commands}
            query={props.query}
            onUp={() => {
              focus()
            }}
            onItem={props.onResult}
            onRef={list}
            defaultComponent={props.ResultComponent}
            isDropDisabled
            areDraggable={false}
            loadsMore={false}
            componentProps={props.componentProps}
          />
        ) : null
      }
      {
        props.query
          ? (
            <button className='bar-dismiss' onClick={(event) => {
              if (barState.items.length === 0) {
                clear()
              } else {
                dismiss()
              }
            }}>{clearIcon}</button>
          ) : null
      }
      <style jsx>{`
        button {
          border: 0;
          background: transparent;
        }
        .bar {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 3;
          height: ${lengths.rowHeight};
          width: 100%;
          display: grid;
          grid-template-columns: ${lengths.rowHeight} 1fr ${lengths.rowHeight} ${lengths.rowHeight};
          grid-template-rows: ${lengths.rowHeight};
          grid-template-areas:
            "bar-menu bar-field bar-dismiss menu";

          .bar-menu {
            grid-area: bar-menu;
            cursor: pointer;
            color: ${colors.textBg};
            z-index: 5;
            padding: 12px;
            &:focus, &:hover {
              color: ${colors.primaryBg};
            }
          }
          .bar-dismiss {
            grid-area: bar-dismiss;
            cursor: pointer;
            z-index: 4;
            padding: 12px;
            color: ${colors.textBg};
          }
          .bar-list {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: ${lengths.rowHeight} 1fr;
            grid-template-areas:
              "nothing"
              "results";
            transition-property: opacity;
            transition-duration: ${durations.moment};
            color: ${colors.black};
            .loader {
              text-align: center;
              cursor: text;
            }
            & > ol {
              grid-area: results;
              max-height: 100vh;
              overflow: auto;
            }
          }
        }
        @media (min-width: ${lengths.mediaWidth}) {
          .bar {
            grid-template-columns: ${lengths.rowHeight} 1fr ${lengths.rowHeight} ${lengths.menuWidth};
          }
        }
      `}</style>
    </div>
  ), [barState.items, props.componentProps, props.query])
}

const props = [
  { name: 'items', type: PropTypes.array.isRequired },
  { name: 'decorateItem', type: PropTypes.func, val: item => item },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'placeholder', type: PropTypes.string, val: '' },
  { name: 'query', type: PropTypes.string.isRequired },
  { name: 'hasMore', type: PropTypes.bool, val: false },
  { name: 'loadMore', type: PropTypes.func, val: () => {} },
  { name: 'areCommands', type: PropTypes.bool, val: true },
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'onFocus', type: PropTypes.func, val: () => {} },
  { name: 'go', type: PropTypes.func.isRequired },
  { name: 'componentProps', type: PropTypes.object, val: {} },
  { name: 'ResultComponent', type: PropTypes.any.isRequired },
  { name: 'onResult', type: PropTypes.object, val: {} },
  { name: 'commands', type: PropTypes.object, val: {} },
  { name: 'filters', type: PropTypes.object, val: {} },
  { name: 'onRef', type: PropTypes.object, val: React.createRef() },
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'loadingTxt', type: PropTypes.string, val: 'Loading...' },
  { name: 'maxReachedTxt', type: PropTypes.string, val: 'Max Reached' },
  { name: 'autoDismiss', type: PropTypes.bool, val: true }
]

Bar.defaultProps = defaultProps(props)
Bar.propTypes = propTypes(props)

export default Bar
