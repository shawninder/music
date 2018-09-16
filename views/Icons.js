import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import cancelIcon from '../components/cancelIcon'
import clearIcon from '../components/clearIcon'
import dequeueIcon from '../components/dequeueIcon'
import enqueueIcon from '../components/enqueueIcon'
import jumpBackToIcon from '../components/jumpBackToIcon'
import jumpToIcon from '../components/jumpToIcon'
import moreIcon from '../components/moreIcon'
import nextIcon from '../components/nextIcon'
import pauseIcon from '../components/pauseIcon'
import playIcon from '../components/playIcon'
import playNowIcon from '../components/playNowIcon'
import prevIcon from '../components/prevIcon'
import searchIcon from '../components/searchIcon'

import '../styles/icons.css'

// const isServer = typeof window === 'undefined'

class Icons extends Component {
  render () {
    return (
      <div className='iconPage'>
        <ul>
          <li>{searchIcon}<span className='label'>search</span></li>
          <li>{prevIcon}<span className='label'>prev</span></li>
          <li>{pauseIcon}<span className='label'>pause</span></li>
          <li>{playIcon}<span className='label'>play</span></li>
          <li>{playNowIcon}<span className='label'>playNow</span></li>
          <li>{nextIcon}<span className='label'>next</span></li>
        </ul>
        <ul>
          <li>{cancelIcon}<span className='label'>cancel</span></li>
          <li>{clearIcon}<span className='label'>clear</span></li>
          <li>{dequeueIcon}<span className='label'>dequeue</span></li>
          <li>{enqueueIcon}<span className='label'>enqueue</span></li>
          <li>{jumpBackToIcon}<span className='label'>jumpBackTo</span></li>
          <li>{jumpToIcon}<span className='label'>jumpTo</span></li>
          <li>{moreIcon}<span className='label'>more</span></li>

        </ul>
        <ul>
          <li><img src='/static/asleep.svg' /><span className='label'>asleep</span></li>
          <li><img src='/static/awake.svg' /><span className='label'>awake</span></li>
          <li><img src='/static/happy.svg' /><span className='label'>happy</span></li>
          <li><img src='/static/glad.svg' /><span className='label'>glad</span></li>
          <li><img src='/static/sad.svg' /><span className='label'>sad</span></li>
          <li><img src='/static/guilty.svg' /><span className='label'>guilty</span></li>
        </ul>
      </div>
    )
  }
}

const props = []

Icons.defaultProps = defaultProps(props)
Icons.propTypes = propTypes(props)

export default Icons
