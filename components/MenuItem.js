import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

class MenuItem extends Component {
  constructor (props) {
    super(props)
    this.toggleDrawer = this.toggleDrawer.bind(this)
    this.state = {
      opened: props.startsOpen
    }
  }

  toggleDrawer () {
    this.setState({ opened: !this.state.opened })
  }

  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('menuItem')
    const openedStyles = {
      maxWidth: '100vw',
      maxHeight: '100vh',
      overflowY: 'scroll',
      overflowScrolling: 'touch'
    }
    const closedStyles = {
      overflow: 'hidden',
      maxHeight: '0'
    }
    return (
      <section className={classes.join(' ')}>
        <h3 onClick={this.toggleDrawer}>{this.props.label}</h3>
        <div className='drawer' style={this.state.opened ? openedStyles : closedStyles}>
          <div className='innards'>
            {this.props.children}
          </div>
        </div>
        <style jsx>{`
          .menuItem {
            h3 {
              font-size: x-large;
              font-weight: bold;
              padding: 15px 10px 0;
              cursor: pointer;
              color: ${colors.link};
              &:hover {
                color: ${colors.hover};
              }
              &:active {
                color: ${colors.primary};
              }
            }
            .drawer {
              transition-property: max-width, max-height, background-color;
              transition-duration: ${durations.moment};
              transition-timing-function: ${tfns.easeInOutQuad};
              .innards {
                padding: 0 10px 10px;
              }
            }
          }
        `}</style>
      </section>
    )
  }
}

const props = [
  { name: 'startsOpen', type: PropTypes.bool, val: false }
]

MenuItem.defaultProps = defaultProps(props)
MenuItem.propTypes = propTypes(props)

export default MenuItem
