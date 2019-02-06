import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Clipboard from 'clipboard'

import colors from '../styles/colors'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

class CopyButton extends Component {
  componentDidMount () {
    this.clipboard = new Clipboard(this.el, {
      target: () => {
        return this.copyLink
      }
    })
    this.clipboard.on('success', (event) => {
      // event.clearSelection()
      this.props.notify({
        id: `party.linkCopied${Math.random()}`,
        body: this.props.dict.get('party.linkCopied'),
        duration: 2000
      })
    })
    this.clipboard.on('error', (event) => {
      console.error('Clipboard error', event)
      // TODO
    })
  }
  componentWillUnmount () {
    this.clipboard.destroy()
  }
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('copyButton')
    return (
      <React.Fragment>
        <span
          className='copyLink'
          key='copyLink'
          ref={(el) => {
            this.copyLink = el
          }}
        >
          {global.location && global.location.href}
        </span>
        <a
          className={classes.join(' ')}
          key='copyButton'
          ref={(el) => {
            this.el = el
          }}
        >
          {this.props.dict.get('party.copyBtn')}
        </a>
        <style jsx>{`
          .copyLink {
            opacity: 0;
            position: absolute;
            z-index: -1;
          }
          .copyButton {
            background: transparent;
            border: 0;
            cursor: pointer;
            text-decoration: underline;
            padding: 3px 5px;
            opacity: 0;
            transition-property: opacity;
            transition-duration: ${durations.instant};
            transition-timing-function: ${tfns.easeInOutQuad};
            color: ${colors.text};
          }
          .copyButton.enabled {
            opacity: 1;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

const props = [
  { name: 'dict', type: PropTypes.object.isRequired },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'notify', type: PropTypes.func, val: console.log }
]

CopyButton.defaultProps = defaultProps(props)
CopyButton.propTypes = propTypes(props)

export default CopyButton
