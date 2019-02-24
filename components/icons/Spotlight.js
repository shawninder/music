import React, { Component } from 'react'

import MrJingles from './Happy'

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
              z-index: 3;
            }
            :global(.jingles) {
              transform: translate(-10%, 15%);
            }
            :global(.jingles-shadow) {
              color: #333333;
              position: absolute;
              left: 10%;
              top: 10%;
              z-index: 2;
              transform: skew(-15deg, 20deg) translate(25%, 15%);
            }
          }
        `}</style>
        <MrJingles className='jingles' key='jingles' />
        <MrJingles className='jingles-shadow' key='jingles-shadow' />
      </div>
    )
  }
}

export default Spotlight
