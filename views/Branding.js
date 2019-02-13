import React, { Component } from 'react'

import Head from '../components/Head'
import cancelIcon from '../components/icons/cancel'
import clearIcon from '../components/icons/clear'
import dequeueIcon from '../components/icons/dequeue'
import enqueueIcon from '../components/icons/enqueue'
import jumpBackToIcon from '../components/icons/jumpBackTo'
import jumpToIcon from '../components/icons/jumpTo'
import moreIcon from '../components/icons/more'
import nextIcon from '../components/icons/next'
import pauseIcon from '../components/icons/pause'
import playIcon from '../components/icons/play'
import playNowIcon from '../components/icons/playNow'
import prevIcon from '../components/icons/prev'
import searchIcon from '../components/icons/search'
import volumeHighIcon from '../components/icons/volumeHigh'
import AddIcon from '../components/icons/AddWink'
import engine from '../components/icons/engine'
import OgImage from '../components/OgImage'

import baseStyles from '../styles/base'
import resetStyles from '../styles/reset'

import colors from '../styles/colors'

class Branding extends Component {
  render () {
    return (
      <div className='brandingPage'>
        <Head title="Crowd's Play | Branding" />
        <h1>Crowd's Play Branding</h1>
        <h2>Colors</h2>
        <ul>
          {Object.keys(colors).map((color) => {
            return (
              <li
                key={color}
                className='swatch'
                style={{
                  background: colors[color]
                }}
              >
                <span className='colorName'>{color}</span>
                <span className='colorHex'>{colors[color]}</span>
              </li>
            )
          })}
        </ul>
        <h2>Buttons</h2>
        <ul>
          <li><button className='primary'>primary</button></li>
          <li><button className='dangerous'>dangerous</button></li>
        </ul>
        <h2>OG images</h2>
        <ul>
          <li><img src='/static/mrJingles.png' /><span className='label'>Mr. Jingles</span></li>
          <li><div className='ogImageContainer'><OgImage className='ogImage' /></div><span className='label'>og:image</span></li>
        </ul>
        <h2>Iconography</h2>
        <ul className='iconList'>
          <li>{searchIcon}<span className='label'>search</span></li>
          <li><AddIcon /><span className='label'>add</span></li>
          <li>{prevIcon}<span className='label'>prev</span></li>
          <li>{pauseIcon}<span className='label'>pause</span></li>
          <li>{playIcon}<span className='label'>play</span></li>
          <li>{playNowIcon}<span className='label'>playNow</span></li>
          <li>{nextIcon}<span className='label'>next</span></li>
          <li>{volumeHighIcon}<span className='label'>volume-high</span></li>
        </ul>
        <ul className='iconList'>
          <li>{cancelIcon}<span className='label'>cancel</span></li>
          <li>{clearIcon}<span className='label'>clear</span></li>
          <li>{dequeueIcon}<span className='label'>dequeue</span></li>
          <li>{enqueueIcon}<span className='label'>enqueue</span></li>
          <li>{jumpBackToIcon}<span className='label'>jumpBackTo</span></li>
          <li>{jumpToIcon}<span className='label'>jumpTo</span></li>
          <li>{moreIcon}<span className='label'>more</span></li>
          <li>{engine}<span className='label'>engine</span></li>
        </ul>
        <h2>Mr. Jingles</h2>
        <ul>
          <li><img src='/static/asleep.svg' /><span className='label'>asleep</span></li>
          <li><img src='/static/awake.svg' /><span className='label'>awake</span></li>
          <li><img src='/static/happy.svg' /><span className='label'>happy</span></li>
          <li><img src='/static/glad.svg' /><span className='label'>glad</span></li>
          <li><img src='/static/sad.svg' /><span className='label'>sad</span></li>
          <li><img src='/static/guilty.svg' /><span className='label'>guilty</span></li>
          <li><img src='/static/manga-skewed.svg' /><span className='label'>manga-skewed</span></li>
          <li><img src='/static/manga.svg' /><span className='label'>manga</span></li>
        </ul>
        <style jsx>{`
          h2 {
            clear: both;
            font-weight: bold;
            font-size: large;
            margin: 30px;
          }
          ul {
            list-style: none;
            clear: both;
          }

          li svg, img {
            vertical-align: middle;
          }

          img {
            background: ${colors.textBg};
            width: 100px;
            height: 100px;
          }

          button {
            border: 1px solid;
            border-radius: 5px;
            padding: 5px;
          }

          .label {
            display: block;
          }

          .iconList li:hover {
            color: ${colors.primaryBg};
          }

          .swatch {
            color: ${colors.textBg};
            width: 150px;
            height: 60px;
            margin: 10px;
            padding: 15px;
            float: left;
          }
          .colorName, .colorHex {
            display: block;
            width: 100%;
            text-align: center;
            text-shadow: 0 0 3px #000000;
          }
          .primary {
            border-color: ${colors.primaryText};
            color: ${colors.primaryText};
            background: ${colors.primaryBg};
          }

          .dangerous {
            border-color: ${colors.dangerousText};
            color: ${colors.dangerousText};
            background: ${colors.dangerousBg};
          }
        `}</style>
        <style jsx global>{`
          ${resetStyles}

          ${baseStyles}

          body {
            background-color: #33333;
            background-image: url('/static/bg.svg');
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-size: 100% 100% !important;
          }

          svg {
            color: ${colors.textBg};
            width: 48px;
            height: 48px;
            fill: currentColor;
          }
        `}</style>
      </div>
    )
  }
}

export default Branding
