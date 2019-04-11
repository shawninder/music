import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

import useClipboard from '../features/clipboard/useClipboard'

const isServer = typeof window === 'undefined'

function CopyButton (props) {
  const button = useRef(null)
  const link = useRef(null)
  const [href, setHref] = useState('')

  useEffect(() => {
    if (!isServer) {
      setHref(global.location && global.location.href)
    }
  }, [global.location && global.location.href])

  useClipboard(button.current, link.current, {
    success: props.onSuccess,
    error: props.onError
  })

  return (
    <>
      <span
        className='copyLink'
        key='copyLink'
        ref={link}
      >
        {href}
      </span>
      <a
        className='copyButton'
        key='copyButton'
        ref={button}
      >
        {props.text}
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
          transition-property: opacity;
          transition-duration: ${durations.instant};
          transition-timing-function: ${tfns.easeInOutQuad};
          color: ${colors.text};
        }
      `}</style>
    </>
  )
}

const props = [
  { name: 'text', type: PropTypes.string, val: 'copy' },
  { name: 'onSuccess', type: PropTypes.func, val: () => {} },
  { name: 'onError', type: PropTypes.func, val: () => {} }
]

CopyButton.defaultProps = defaultProps(props)
CopyButton.propTypes = propTypes(props)

export default CopyButton
