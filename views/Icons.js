import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import Head from '../components/Head'
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

// const isServer = typeof window === 'undefined'

class Icons extends Component {
  render () {
    return (
      <div className='iconPage'>
        <Head title="Crowd's Play | Icons" />
        <style jsx global>{`
          body {
            background-color: #33333;
            background-image: url('/static/bg.svg');
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-size: 100% 100% !important;
          }
          .iconPage ul {
            list-style: none;
            clear: both;
          }
          .iconPage li {
            color: whitesmoke;
            margin: 10px;
            width: 150px;
            float: left;
          }
          .iconPage .label {
            display: block;
          }
          .iconPage li svg, .iconPage img {
            vertical-align: middle;
          }
          .iconPage svg {
            color: whitesmoke;
            width: 48px;
            height: 48px;
            fill: currentColor;
          }

          .iconPage img {
            background: whitesmoke;
            width: 100px;
            height: 100px;
          }
        `}</style>
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
