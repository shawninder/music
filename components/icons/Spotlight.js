import React, { Component } from 'react'

import MrJingles from './Happy'
import SadMrJingles from './Sad'

import colors from '../../styles/colors'

class Spotlight extends Component {
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('spotlight')
    return (
      <div className={classes.join(' ')} key='spotlight'>
        <style jsx>{`
          .spotlight {
            position: relative;
            background: ${colors.spotlight};
            :global(.jingles) {
              position: relative;
              color: ${colors.text};
              z-index: 2;
            }
            :global(.jingles) {
              transform: translate(-10%, 15%);
            }
            :global(.jingles-shadow) {
              color: #333333;
              position: absolute;
              left: 10%;
              top: 10%;
              z-index: 1;
              transform: skew(-15deg, 20deg) translate(25%, 15%);
            }
          }
        `}</style>
        <MrJingles className='jingles' key='jingles' />
        {this.props.variant === 'surprised' ? (
          <SadMrJingles className='jingles-shadow' key='jingles-shadow' />
        ) : (
          <MrJingles className='jingles-shadow' key='jingles-shadow' />
        )}
      </div>
    )
  }
}

export default Spotlight
