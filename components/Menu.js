import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import useListeners from '../features/listeners/use'

import colors from '../styles/colors'
import durations from '../styles/durations'
import lengths from '../styles/lengths'
import tfns from '../styles/timing-functions'

import List from './List'
import MenuItem from './MenuItem'
import Integration from './Integration'
import Footer from './Footer'
import Happy from './icons/Happy'
import Sad from './icons/Sad'

import PartyContext from '../features/party/context'
import passiveSupported from '../helpers/passiveSupported'

const listenerOptions = passiveSupported ? { passive: true, capture: false } : false

function Menu (props) {
  const { socket } = useContext(PartyContext)
  const [collapsed, setCollapsed] = useState(true)

  const { keyDown } = useListeners({
    esc: (event) => {
      setCollapsed(false)
    },
    space: (event) => {
      toggleMenu()
    },
    enter: (event) => {
      toggleMenu()
    }
  }, { listenerOptions })

  function toggleMenu () {
    setCollapsed(!collapsed)
  }

  function onClick (event) {
    event.stopPropagation() // Avoid letting the global click listeners collapse the party
    toggleMenu()
  }

  const Image = (socket && socket.connected)
    ? Happy
    : Sad

  const opened = {
    maxWidth: '100vw',
    maxHeight: '100vh',
    overflowY: 'scroll',
    overflowScrolling: 'touch',
    transition: `max-width ${durations.moment} ${tfns.easeInOutQuad}, max-height ${durations.moment} ${durations.instant} ${tfns.easeInOutQuad}`
  }
  const collapsedStyles = {
    overflowY: 'hidden',
    maxHeight: lengths.collapsedHeight,
    transition: `max-width ${durations.moment} ${durations.shortMoment} ${tfns.easeInOutQuad}, max-height ${durations.moment} ${tfns.easeInOutQuad}`
  }

  const visible = {
    transition: `opacity ${durations.moment} ${tfns.easeInExpo}`,
    opacity: 1
  }
  const invisible = {
    transition: `opacity ${durations.moment} ${tfns.easeOutExpo}`,
    opacity: 0
  }

  const integrations = [
    { name: 'YouTube', key: 'youtube-integration', icon: '/static/youtube.png' },
    { name: 'iTunes', key: 'itunes-integration', icon: '/static/itunes.svg' },
    { name: 'Spotify', key: 'spotify-integration', icon: '/static/spotify.png' },
    { name: 'Other', key: 'other-integration', icon: '/static/plus.svg', alt: 'Request support for another service' }
  ]

  const computerApps = [
    { name: 'Linux', key: 'youtube-integration', icon: '/static/linux.png' },
    { name: 'Mac', key: 'itunes-integration', icon: '/static/mac.svg' },
    { name: 'Windows', key: 'spotify-integration', icon: '/static/windows.svg' }
  ]

  const phoneApps = [
    { name: 'Android', key: 'android-integration', icon: '/static/android.svg' },
    { name: 'iOS', key: 'ios-integration', icon: '/static/ios.png' }
  ]

  return (
    <div
      className='menu'
      onKeyDown={keyDown}
      tabIndex='0'
      style={collapsed ? collapsedStyles : opened}
    >
      <div className='tab' onClick={onClick}>
        <span className='branding' style={collapsed ? {} : visible}>Crowd's Play</span>
        <Image className='face' />
      </div>
      <div className='contents' style={collapsed ? invisible : visible}>
        {props.showWIP ? (
          <MenuItem
            label='Login'
            startsOpen
          >
            <div className='login'>
              <label>@<input type='email' /></label>
              <p>We'll send you a login link via e-mail</p>
              <p>Click the login link we sent to <em>your@email.com</em></p>
            </div>
          </MenuItem>
        ) : null}
        {props.showWIP ? (
          <MenuItem
            label='Connect your other accounts'
          >
            <div className='integrations'>
              <List items={integrations} defaultComponent={Integration} />
            </div>
          </MenuItem>
        ) : null}
        {props.showWIP ? (
          <MenuItem
            label='Settings'
          >
            <div className='settings'>
              settings
            </div>
          </MenuItem>
        ) : null}
        {props.showWIP ? (
          <MenuItem
            label='Get the app'
          >
            <div className='apps'>
              <List items={computerApps} defaultComponent={Integration} />
              <List items={phoneApps} defaultComponent={Integration} />
              <Integration
                key='request-new-device'
                data={{
                  name: 'Other devices',
                  icon: '/static/plus.svg',
                  alt: 'Request support for another class of device'
                }}
              />
            </div>
          </MenuItem>
        ) : null}
        <Footer showWIP={props.showWIP} />
      </div>
      <style jsx>{`
        .menu {
          position: fixed;
          top: 0;
          right: 0;
          max-width: ${lengths.rowHeight};
          border-radius: 0 0 0 3px;
          font-size: medium;
          z-index: 4;
          color: ${colors.text};
          background-color: ${colors.textBg};
          font-family: palatino;
          box-shadow: -5px 0 5px 0px rgb(0, 0, 0, 0.25);
          .tab {
            padding: 5px;
            height: ${lengths.collapsedHeight};
            cursor: pointer;
          }
          .branding {
            float: left;
            font-weight: bold;
            position: absolute;
            padding: 5px;
            top: 0;
            left: 0;
            opacity: 0;
          }
          .face {
            margin: 5px;
            width: 30px;
            height: 30px;
            float: right;
          }
          &.attending {
            background-color: ${colors.attendingBg};
          }
          &.hosting {
            background-color: ${colors.hosting};
          }
          .contents {
            text-align: center;
            .login {
              label {
                padding: 10px;
                font-family: monospace;
                font-size: 2em;
                input {
                  margin-bottom: 5px;
                  font-size: medium;
                  line-height: 2em;
                  font-family: sans-serif;
                }
              }
            }
            .integrations {
              :global(li) {
                display: inline-block;
              }
            }
            .apps :global(.list li) {
              display: inline-block;
            }
          }
        }
        @media (min-width: ${lengths.mediaWidth}) {
          .menu {
            max-width: ${lengths.menuWidth};
            .branding {
              opacity: 1;
            }
          }
        }
      `}</style>
    </div>
  )
}

const props = [
  { name: 'showWIP', type: PropTypes.bool, val: false }
]

Menu.defaultProps = defaultProps(props)
Menu.propTypes = propTypes(props)

export default Menu
