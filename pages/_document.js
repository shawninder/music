// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

import 'babel-polyfill'

import React, { useContext } from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import flush from 'styled-jsx/server'

import DictContext from '../features/dict/context'

import { resetServerContext } from 'react-beautiful-dnd'

function Doc (props) {
  const { dict } = useContext(DictContext)
  return (
    <html lang={dict.using}>
      <Head>
        <link rel='shotcut icon' href='static/favicon.ico' sizes='16x16 32x32' />
        <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0' />
        <meta name='theme-color' content='#333333' />
        {/* <link rel='manifest' href='/static/manifest/manifest.json' /> */}
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css' />
        {props.styles}
        <meta property='og:url' content='https://crowds-play.com' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content="Crowd's Play" />
        <meta property='og:image' content={`https://crowds-play.com/static/ogImg.png`} />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:description' content={dict.get('header.tagline')} />
        <meta property='og:updated_time' content='1550510380' />
        <meta property='fb:app_id' content='802539780107102' />
      </Head>
      <body tabIndex='-1'>
        <noscript>
          <p>{dict.get('app.nojs')}</p>
        </noscript>
        <Main />
        <NextScript />
        <script src='https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.0/jsmediatags.min.js' />
      </body>
    </html>
  )
}

class MyDocument extends Document {
  static getInitialProps ({ renderPage, req }) {
    resetServerContext()
    const bits = renderPage()
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    const styles = flush()
    return { ...bits, headers, acceptLanguage, styles }
  }
  render () {
    return (
      <Doc />
    )
  }
}

export default MyDocument
