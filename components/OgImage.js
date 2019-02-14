import React, { Component } from 'react'
import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import List from './List'
import Smart from './Smart'
import NoticeList from './NoticeList'

import colors from '../styles/colors'

import lengths from '../styles/lengths'

import alpha from '../helpers/alpha'

import Dict from '../data/Dict'
import txt from '../data/txt.json'

const items = [
  {
    type: 'YouTube',
    key: 'CTdg3uFZOsk',
    id: {
      videoId: 'CTdg3uFZOsk'
    },
    snippet: {
      title: 'Carry On',
      channelTitle: 'Key Of Groove [The Choice]',
      thumbnails: {
        default: {
          url: 'https://i.ytimg.com/vi/CTdg3uFZOsk/default.jpg'
        }
      }
    },
    inQueue: true,
    queueIndex: -1
  },
  {
    type: 'YouTube',
    key: 'velourTintinmp3',
    id: {
      videoId: 'velourTintinmp3'
    },
    snippet: {
      title: 'Velour Tintin',
      channelTitle: 'Shawn Inder',
      thumbnails: {
        default: {
          url: '/static/velour-tintin.jpg'
        }
      }
    },
    inQueue: true,
    queueIndex: 0
  },
  {
    type: 'YouTube',
    key: '3CKbrkT3CnE',
    id: {
      videoId: '3CKbrkT3CnE'
    },
    snippet: {
      title: 'Feeling Good',
      channelTitle: 'Dominique Fils-Aimé',
      thumbnails: {
        default: {
          url: 'https://i.ytimg.com/vi/3CKbrkT3CnE/default.jpg'
        }
      }
    },
    inQueue: true,
    queueIndex: 2
  },
  {
    type: 'YouTube',
    key: '_jSyjWsMqFM',
    id: {
      videoId: '_jSyjWsMqFM'
    },
    snippet: {
      title: 'Let Me Be',
      channelTitle: 'Tamara Weber-Fillion',
      thumbnails: {
        default: {
          url: 'https://i.ytimg.com/vi/_jSyjWsMqFM/default.jpg'
        }
      }
    },
    inQueue: true,
    queueIndex: 1
  }
]

class OgImage extends Component {
  static getInitialProps ({ renderPage, req }) {
    // TODO remove everything except the headers and query string stuff, which are the only non-default things I'm trying to do
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    return { headers, acceptLanguage }
  }
  constructor (props) {
    super(props)
    this.dict = new Dict(txt, ['en', 'fr'], props.acceptLanguage, global.navigator)
  }
  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('box')
    return (
      <div className={classes.join(' ')}>
        <div className='fakeBar'>
          <p className='name'>Crowd's</p>
          <div className='face'>
            Play
            <img src='/static/mrJingles.svg' alt='Happy Mr. Jingles' />
          </div>
        </div>
        <NoticeList
          className='tagline'
          notices={[{
            id: 'tagline',
            body: this.dict.get('header.tagline')
          }]}
          showing
        />
        <div className='main'>
          <List
            className='tracklist'
            items={items}
            componentProps={{
              actions: {
                play: {
                  txt: 'play'
                }
              }
            }}
            defaultComponent={Smart}
          />
        </div>
        <div className='fakeSeek'><div className='progress' /></div>
        <p className='url'>https://crowds-play.com</p>
        <style jsx>{`
          .box {
            position: relative;
            width: 600px;
            height: 315px;
            overflow: hidden;
            font-family: palatino;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: ${lengths.rowHeight} 1fr 10px ${lengths.rowHeight};
            grid-template-areas:
              "fakeBar"
              "main"
              "fakeSeek"
              "url";

            .fakeBar {
              grid-area: fakeBar;
              display: grid;
              grid-template-columns: 440px ${lengths.menuWidth};
              grid-template-rows: ${lengths.rowHeight};
              grid-template-areas: "name face";
              .name, .face {
                font-size: 35px;
              }
              .name {
                grid-area: name;
                padding: 5px 5px 5px 60px;
                font-weight: bold;
                background: ${colors.text};
                color: ${colors.textBg};
                text-align: right;
              }
              .face {
                grid-area: face;
                padding: 5px;
                background: ${colors.textBg};
                color: ${colors.text};
                img {
                  width: ${lengths.iconWidth};
                  height: ${lengths.iconWidth};
                  float: right;
                }
              }
            }
            .name, .face, .main, .url {
              margin: 0;
            }
            .main {
              grid-area: main;
              background: ${colors.primaryBg} url('/static/bg.svg');
              overflow: hidden;
              filter: blur(3px);
            }
            .fakeSeek {
              grid-area: fakeSeek;
              background: ${colors.text};
              width: 100%;
              .progress {
                background: red;
                width: 100%;
                height: 10px;
              }
            }
            .url {
              grid-area: url;
              background: #333333;
              padding: 13px;
              text-align: center;
              font-size: 24px;
              color: ${colors.textBg};
            }
          }
        `}</style>
        <style jsx global>{`
          .tracklist li {
            background: ${alpha(colors.textBg, colors.opacity)};
            height: ${lengths.rowHeight};
            svg {
              color: ${colors.text};
            }
          }
          .tracklist li:nth-child(2) {
            background: ${alpha(colors.text, 1 - colors.opacity)};
            color: ${colors.textBg};
            height: 64px;
            svg {
              color: ${colors.textBg};
            }
            .art {
              .idx {
                width: 0;
              }
              .art-img {
                width: 88px;
                height: 60px;
                border-radius: 0;
              }
            }
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' }
]

OgImage.defaultProps = defaultProps(props)
OgImage.propTypes = propTypes(props)

export default OgImage
