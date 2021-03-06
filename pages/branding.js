import React, { useState } from 'react'
import Head from '../components/Head'
import Menu from '../components/Menu'
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
import Engine from '../components/icons/engine'
import Spotlight from '../components/icons/Spotlight'
import OgImg from '../components/OgImg'
import Happy from '../components/icons/Happy'
import Sad from '../components/icons/Sad'
import Range from '../components/Range'
import Footer from '../components/Footer'
import TimingFunction from '../components/TimingFunction'
import ActionList from '../components/ActionList'

import AudioFile from '../components/AudioFile'
import YouTube from '../components/YouTube'
// import NoticeList from '../components/NoticeList'

import baseStyles from '../styles/base'
import resetStyles from '../styles/reset'

import colors from '../styles/colors'
import lengths from '../styles/lengths'
import tfns from '../styles/timing-functions'
import alpha from '../helpers/alpha'

export default function BrandingPage (props) {
  const [faviconBg, setFaviconBg] = useState(undefined)

  function toggleFaviconBg () {
    setFaviconBg(!faviconBg ? 'white' : undefined)
  }

  return (
    <div className='brandingPage'>
      <Head title="Crowd's Play | Branding" />
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
      `}</style>
      <style jsx>{`
        h1 {
          font-size: 100px;
        }
        dt {
          clear: both;
          font-weight: bold;
          font-size: xx-large;
          padding: 30px;
        }
        dd {
          border: 1px solid transparent;
        }
        ul {
          list-style: none;
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

        .colors li {
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

        .lengths  li {
          line-height: 1em;
          margin: 5px;

          .lengthName {
            width: 150px;
            display: inline-block;
          }
          .lengthValue {
            display: inline-block;
            height: 1em;
            font-weight: bold;
            background: ${colors.hostingBg}
          }
        }

        .tfns {
          label {
            margin-right: 30px;
          }
        }

        .indicators {
          :global(svg) {
            width: 25px;
            height: 25px;
            border-radius: 25px;
            fill: currentColor;
          }
          :global(svg.on) {
            color: ${colors.attendingBg};
            background-color: ${colors.primary};
          }
          :global(svg.off) {
            color: ${colors.dangerousBg};
            background-color: ${colors.dangerousText};
          }
          li {
            display: inline-block;
            margin: 10px;
          }
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

        .tracks {
          max-width: ${lengths.mediaWidth};
          li {
            &.result {
              &:nth-child(odd) {
                background: ${colors.textBgOdd};
              }

              &:nth-child(even) {
                background: ${colors.textBgEven};
              }
            }
            &.empty {
              min-height: 1px;
            }
            &.empty, &.history, &.upNext {
              background: ${alpha(colors.textBg, colors.opacity)};
            }
            &.playingNow {
              background: ${alpha(colors.text, 1 - colors.opacity)};
              color: ${colors.textBg};
              :global(.art .idx) {
                width: 0;
                transform: translate(25px);
              }
              :global(.art .art-img) {
                width: 88px;
                height: 60px;
                border-radius: 0;
              }
            }
          }
        }

        .buttonList {
          li {
            display: inline-block;
            margin: 10px;
            color: ${colors.textBg};
            vertical-align: middle;
          }
          :global(svg) {
            color: ${colors.textBg};
            width: 48px;
            height: 48px;
            fill: currentColor;
            cursor: pointer;
            &:hover {
              color: ${colors.primaryBg};
            }
          }
        }
        .ranges li {
          display: inline-block;
          margin: 10px;
          vertical-align: middle;
          :global(.horizontal) {
            width: 150px;
            height: 10px;
            :global(.current) {
              height: 8px;
            }
            :global(.handle) {
              width: 30px;
              height: 30px;
              top: -10px;
              left: -15px;
              background: ${alpha(colors.textBg, 0.4)};
            }
          }
          :global(.vertical) {
            height: 150px;
            width: 5px;
            margin-left: 22px;
            :global(.current) {
              position: absolute;
              bottom: 0;
              width: 100%;
              background-color: red;
            }
            :global(.handle) {
              bottom: 0;
              left: -23px;
              width: 50px;
              height: 50px;
              background: ${alpha(colors.textBg, 0.4)};
              border-radius: 5px;
            }
          }
        }
        .links {
          background: ${colors.textBg};
        }
      `}</style>
      <Menu dispatch={(action) => {
        console.log('Branding page getting a dispatch?', action)
      }} />
      <h1>Branding</h1>
      <dl>
        <dt>Share banner</dt>
        <dd><OgImg /></dd>
        <dt>favicon</dt>
        <dd
          style={{ width: '300px', background: faviconBg }}
          onClick={() => {
            toggleFaviconBg()
          }}>
          <Spotlight variant='clean' size={16} display='inline-block' />
          <Spotlight variant='clean' size={32} display='inline-block' />
          <Spotlight variant='clean' size={64} display='inline-block' />
        </dd>
        <dt>Color palette</dt>
        <dd>
          <ul className='colors'>
            {Object.keys(colors).map((color) => {
              return (
                <li
                  key={color}
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
        </dd>
        <dt>Lengths</dt>
        <dd>
          <ul className='lengths'>
            {Object.keys(lengths).map((length) => {
              return (
                <li key={length}>
                  <label className='lengthName'>{length}</label>
                  <span className='lengthValue'
                    style={{
                      width: lengths[length]
                    }}
                  >
                    {lengths[length]}
                  </span>
                </li>
              )
            })}
          </ul>
        </dd>
        <dt id='timing-functions'>Timing functions</dt>
        <dd>
          <ul className='tfns'>
            {Object.keys(tfns).map((tfn) => {
              return (
                <li key={tfn} style={{ display: 'inline-block', margin: '20px' }}>
                  <TimingFunction name={tfn} fn={tfns[tfn]} />
                </li>
              )
            })}
          </ul>
        </dd>
        <dt>Indicators</dt>
        <dd>
          <ul className='indicators'>
            <li><Engine on /></li>
            <li><Engine /></li>
            <li><Happy /></li>
            <li><Sad /></li>
          </ul>
        </dd>
        <dt>Tracks</dt>
        <dd className='tracks'>
          <ul>
            <li>results</li>
            <li className='result'>
              <YouTube
                data={{
                  key: 'first-result',
                  snippet: {
                    thumbnails: {
                      default: {
                        url: '/static/velour-tintin.jpg'
                      }
                    },
                    title: 'Velour Tintin',
                    channelTitle: 'Shawn Inder'
                  }
                }}
              />
            </li>
            <li className='result'>
              <YouTube
                data={{
                  key: 'result-even',
                  snippet: {
                    thumbnails: {
                      default: {
                        url: '/static/velour-tintin.jpg'
                      }
                    },
                    title: 'Velour Tintin',
                    channelTitle: 'Shawn Inder'
                  }
                }}
              />
            </li>
            <li className='result'>
              <YouTube
                data={{
                  key: 'result-odd',
                  snippet: {
                    thumbnails: {
                      default: {
                        url: '/static/velour-tintin.jpg'
                      }
                    },
                    title: 'Velour Tintin',
                    channelTitle: 'Shawn Inder'
                  }
                }}
              />
            </li>
            <li>empty</li>
            <li className='empty' />
            <li>history</li>
            <li className='history'>
              <YouTube
                data={{
                  key: 'queued-history',
                  inQueue: true,
                  queueIndex: -1,
                  snippet: {
                    thumbnails: {
                      default: {
                        url: '/static/velour-tintin.jpg'
                      }
                    },
                    title: 'Velour Tintin',
                    channelTitle: 'Shawn Inder'
                  }
                }}
              />
            </li>
            <li>playing now</li>
            <li className='playingNow'>
              <YouTube
                data={{
                  key: 'queued-now',
                  inQueue: true,
                  queueIndex: 0,
                  snippet: {
                    thumbnails: {
                      default: {
                        url: '/static/velour-tintin.jpg'
                      }
                    },
                    title: 'Velour Tintin',
                    channelTitle: 'Shawn Inder'
                  }
                }}
              />
            </li>
            <li>up next</li>
            <li className='upNext'>
              <YouTube
                data={{
                  key: 'queued-upnext',
                  inQueue: true,
                  queueIndex: 1,
                  snippet: {
                    thumbnails: {
                      default: {
                        url: '/static/velour-tintin.jpg'
                      }
                    },
                    title: 'Velour Tintin',
                    channelTitle: 'Shawn Inder'
                  }
                }}
              />
            </li>
            <li className='upNext'>
              <AudioFile
                data={{
                  id: 'audio-upnext',
                  inQueue: true,
                  queueIndex: 2,
                  meta: {
                    tags: {
                      title: 'Velour Tintin',
                      artist: 'Shawn Inder',
                      picture: {
                        format: 'image/jpeg',
                        data: ''
                      }
                    }
                  }
                }}
              />
            </li>
          </ul>
        </dd>
        <dt>Actions</dt>
        <dd>
          <ActionList
            showing
            data={{ some: 'data' }}
            actions={{
              log: {
                txt: 'Log',
                go: (data, idx, queueIndex, event) => {
                  console.log(data, idx, queueIndex, event)
                }
              },
              warn: {
                txt: 'Warn',
                go: (data, idx, queueIndex, event) => {
                  console.warn(data, idx, queueIndex, event)
                }
              },
              error: {
                txt: 'Error',
                go: (data, idx, queueIndex, event) => {
                  console.error(data, idx, queueIndex, event)
                }
              }
            }}
          />
        </dd>
        <dt>
          Buttons
        </dt>
        <dd>
          <ul className='buttonList'>
            <li><button className='primary'>primary</button></li>
            <li><button className='dangerous'>dangerous</button></li>
            <li>{searchIcon}<span className='label'>search</span></li>
            <li><AddIcon /><span className='label'>add</span></li>
            <li>{prevIcon}<span className='label'>prev</span></li>
            <li>{pauseIcon}<span className='label'>pause</span></li>
            <li>{playIcon}<span className='label'>play</span></li>
            <li>{playNowIcon}<span className='label'>playNow</span></li>
            <li>{nextIcon}<span className='label'>next</span></li>
            <li>{volumeHighIcon}<span className='label'>volume-high</span></li>
            <li>{cancelIcon}<span className='label'>cancel</span></li>
            <li>{clearIcon}<span className='label'>clear</span></li>
            <li>{dequeueIcon}<span className='label'>dequeue</span></li>
            <li>{enqueueIcon}<span className='label'>enqueue</span></li>
            <li>{jumpBackToIcon}<span className='label'>jumpBackTo</span></li>
            <li>{jumpToIcon}<span className='label'>jumpTo</span></li>
            <li>{moreIcon}<span className='label'>more</span></li>
          </ul>
        </dd>
        <dt>Ranges</dt>
        <dd>
          <ul className='ranges'>
            <li>
              <Range
                key='range-horizontal'
                current={0.5}
              />
            </li>
            <li>
              <Range
                key='range-vertical'
                current={0.5}
                vertical
              />
            </li>
          </ul>
        </dd>
        {/* <dt>Messages</dt>
        <dd>
          <NoticeList
            notices={[{
              id: 'n1',
              body: 'Hello Notice',
              progress: 0.5,
              buttons: {
                ok: {
                  label: 'OK'
                },
                no: {
                  label: 'Cancel'
                }
              }
            }]}
            showing
          />
        </dd> */}
        <dt className='links'>Footer</dt>
        <dd className='links'><Footer /></dd>
      </dl>
    </div>
  )
}
