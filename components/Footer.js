import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import pkg from '../package.json'
import colors from '../styles/colors'
import lengths from '../styles/lengths'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

class Footer extends Component {
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('footer')
    return (
      <footer className={classes.join(' ')}>
        <ul>
          {this.props.showWIP ? (<li><a href='/pricing'>Pricing</a></li>) : null}
          <li><a href='https://github.com/shawninder/music/blob/master/static/texts/faq.en.md#faq' target='_blank'><acronym title='Frequently Asked Questions'>FAQ</acronym></a></li>
          <li><a href='https://github.com/shawninder/music/blob/master/static/texts/privacy.en.md#privacy-policy' target='_blank'>Privacy</a></li>
          <li><a href='https://github.com/shawninder/music/blob/master/static/texts/terms.en.md#terms' target='_blank'>Terms</a></li>
        </ul>
        <mark className='version'>version: {pkg.version}</mark>
        <style jsx>{`
          .footer {
            margin-top: ${lengths.rowHeight};
            padding: 10px 10px 0;
            ul {
              list-style: none;
              li {
                margin: 2px 8px;
                display: inline-block;
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
            .version {
              background: transparent;
              font-size: small;
              padding: 5px;
              display: block;
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

Footer.defaultProps = defaultProps(props)
Footer.propTypes = propTypes(props)

export default Footer
