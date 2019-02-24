import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import lengths from '../styles/lengths'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

class Links extends Component {
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('links')
    return (
      <footer className={classes.join(' ')}>
        <ul>
          <li><a href='https://github.com/shawninder/music/blob/master/static/texts/faq.en.md#faq' target='_blank'><acronym title='Frequently Asked Questions'>FAQ</acronym></a></li>
          <li><a href='https://github.com/shawninder/music/blob/master/static/texts/privacy.en.md#privacy-policy' target='_blank'>Privacy</a></li>
          <li><a href='https://github.com/shawninder/music/blob/master/static/texts/terms.en.md#terms' target='_blank'>Terms</a></li>
        </ul>
        <style jsx>{`
          .links {
            margin-top: ${lengths.rowHeight};
            padding: 10px;
            ul {
              list-style: none;
              li {
                margin: 2px;
                a {
                  cursor: pointer;
                  color: ${colors.link};
                  transition-property: color;
                  transition-duration: ${durations.instant};
                  transition-timing-function: ${tfns.easeInOutQuad};
                }
                a:hover {
                  color: ${colors.primary};
                }
              }
            }
          }
        `}</style>
      </footer>
    )
  }
}

const props = [
  { name: 'dict', type: PropTypes.object.isRequired },
  { name: 'notify', type: PropTypes.func, val: console.log }
]

Links.defaultProps = defaultProps(props)
Links.propTypes = propTypes(props)

export default Links
