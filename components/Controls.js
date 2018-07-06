import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

// TODO Find a way to import svgs
const playIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 2080.7722 2080.7722'
    style={{
      'clip-rule': 'evenodd',
      'fill-rule': 'evenodd',
      'image-rendering': 'optimizeQuality',
      'shape-rendering': 'geometricPrecision',
      'text-rendering': 'geometricPrecision'
    }}
    version='1.1'
    title='play'
    alt='play'
    class='icon'
  >
    <g
      transform='translate(-3233.5713,-3531.2278)'
    >
      <path
        d='M 3648,5363 4879,4572 3648,3780 Z m -36,232 c -14,11 -32,17 -52,17 -49,0 -88,-39 -88,-88 v -1905 0 c 0,-16 4,-33 14,-48 26,-40 81,-52 122,-26 567.4233,315.5455 1395.2655,934.8411 1429.2366,959.0457 34.6354,24.6779 29.879,31.1801 37.3045,70.0595 7.9536,41.6444 -19.6035,85.8883 -57.4606,115.7788 C 4959.4747,4735.3673 4077.4111,5292.9447 3612,5595 Z'
      />
    </g>
  </svg>
)
// TODO Find a way to import svgs
const pauseIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    version='1.1'
    style={{
      'clip-rule': 'evenodd',
      'fill-rule': 'evenodd',
      'image-rendering': 'optimizeQuality',
      'shape-rendering': 'geometricPrecision',
      'text-rendering': 'geometricPrecision'
    }}
    viewBox='0 0 1657.9999 1657.9999'
    title='pause'
    alt='pause'
    class='icon'
  >
    <g
      transform='translate(-3743,-3743)'
    >
      <path
        d='M 3831,3743 h 543 c 49,0 88,39 88,88 v 1482 c 0,49 -39,88 -88,88 h -543 c -49,0 -88,-39 -88,-88 V 3831 c 0,-49 39,-88 88,-88 z m 455,176 h -367 v 1306 h 367 z m 484,-176 h 543 c 49,0 88,39 88,88 v 1482 c 0,49 -39,88 -88,88 h -543 c -49,0 -88,-39 -88,-88 V 3831 c 0,-49 39,-88 88,-88 z m 455,176 h -367 v 1306 h 367 z'
      />
    </g>
  </svg>
)
// TODO Find a way to import svgs
const prevIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    version='1.1'
    style={{
      'clip-rule': 'evenodd',
      'fill-rule': 'evenodd',
      'image-rendering': 'optimizeQuality',
      'shape-rendering': 'geometricPrecision',
      'text-rendering': 'geometricPrecision'
    }}
    viewBox='0 0 2199.9999 2199.9999'
    title='previous'
    alt='previous'
    class='icon'
  >
    <g
      transform='translate(-3472,-3471.5)'
    >
      <path
        d='M 5532,5595 4054,4646 c -40,-26 -52,-81 -26,-122 7,-11 17,-20 28,-27 l 1480,-952 c 41,-26 96,-14 122,26 10,15 14,32 14,48 v 0 1905 c 0,49 -39,88 -88,88 -20,0 -38,-6 -52,-17 z M 4265,4572 5496,5363 V 3780 Z'
      />
      <path
        d='m 4014,3707 h -366 v 1729 h 366 z m -454,-176 h 542 c 49,0 88,39 88,88 v 1905 c 0,49 -39,88 -88,88 h -542 c -49,0 -88,-39 -88,-88 V 3619 c 0,-49 39,-88 88,-88 z'
      />
    </g>
  </svg>
)
// TODO Find a way to import svgs
const nextIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 2199.9999 2199.9999'
    style={{
      'clip-rule': 'evenodd',
      'fill-rule': 'evenodd',
      'image-rendering': 'optimizeQuality',
      'shape-rendering': 'geometricPrecision',
      'text-rendering': 'geometricPrecision'
    }}
    version='1.1'
    title='next'
    alt='next'
    class='icon'
  >
    <g
      transform='translate(-3472,-3471.5)'
    >
      <path
        d='m 5042,3531 h 542 c 49,0 88,39 88,88 v 1905 c 0,49 -39,88 -88,88 h -542 c -49,0 -88,-39 -88,-88 v -791 -322 -792 c 0,-49 39,-88 88,-88 z m 454,176 h -366 v 1729 h 366 z M 3648,5363 4258.3007,4970.8409 4879,4572 3648,3780 Z m 1306,-630 -1342,862 c -14,11 -32,17 -52,17 -49,0 -88,-39 -88,-88 v -1905 0 c 0,-16 4,-33 14,-48 26,-40 81,-52 122,-26 l 1346,866 z'
      />
    </g>
  </svg>
)
class Controls extends Component {
  render () {
    return (
      <div
        key='controls'
        className='controls'
      >
        <div key='seek-bar' className='seek-bar'>
          <div key='seek-bar--played' className='seek-bar--played'
            style={{
              width: `${this.props.f * 100}%`
            }}
          />
          <div key='seek-bar--handle' className='seek-bar--handle'
            style={{
              marginLeft: `${this.props.f * 100}%`
            }}
          />
        </div>

        <div className='bug-partial-fix' />
        {/* TODO Fix :p
          The seek-bar somehow ends up with this className ('bug-partial-fix')
          instead of `controls-buttons`, which is marginally better.
        Obviously a better fix is required */}

        <div key='controls-buttons' className='controls-buttons'>
          <button
            key='controls-prev'
            className='controls-prev'
            onClick={(event) => {
              event.stopPropagation()
              if (this.props.t < 3) {
                this.props.dispatch({
                  type: 'Queue:prev'
                })
              } else {
                this.props.restartTrack()
              }
            }}
          >
            {prevIcon}
          </button>

          <button
            key='controls-togglePlaying'
            className='controls-togglePlaying'
            onClick={(event) => {
              event.stopPropagation()
              this.props.dispatch({
                type: 'Player:togglePlaying'
              })
            }}
          >
            {this.props.playing
              ? pauseIcon
              : playIcon}
          </button>

          <button
            key='controls-next'
            className='controls-next'
            onClick={(event) => {
              event.stopPropagation()
              this.props.dispatch({
                type: 'Queue:next'
              })
            }}
          >
            {nextIcon}
          </button>
        </div>
      </div>
    )
  }
}

const props = [
  { name: 'playing', type: PropTypes.bool.isRequired },
  { name: 'f', type: PropTypes.number, val: 0 },
  { name: 'history', type: PropTypes.array.isRequired },
  { name: 'upNext', type: PropTypes.array.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

Controls.defaultProps = defaultProps(props)
Controls.propTypes = propTypes(props)

export default Controls
