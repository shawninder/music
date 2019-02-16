// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

import '@babel/polyfill'

import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import flush from 'styled-jsx/server'
import Dict, { guessLang } from '../data/Dict'
import txt from '../data/txt.json'

export default class MyDocument extends Document {
  static getInitialProps ({ renderPage, req }) {
    // TODO remove everything except the headers and query string stuff, which are the only non-default things I'm trying to do
    const { html, head, errorHtml, chunks } = renderPage()
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    const styles = flush()
    return { html, head, errorHtml, chunks, headers, acceptLanguage, styles }
  }
  constructor (props) {
    super(props)
    this.dict = new Dict(txt, ['en', 'fr'], props.acceptLanguage, global.navigator)
  }
  render () {
    const lang = guessLang(['en', 'fr'], this.props.acceptLanguage, global.navigator)
    return (
      <html lang={lang}>
        <Head>
          <link rel='shotcut icon' href='static/favicon.ico' />
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0' />
          <meta name='theme-color' content='#333333' />
          <link rel='manifest' href='/static/manifest/manifest.json' />
          <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css' />
          <meta property='og:url' content='https://crowds-play.com' />
          <meta property='og:type' content='website' />
          <meta property='og:title' content="Crowd's Play" />
          <meta property='og:image' content={`https://crowds-play.com/static/ogImage.png`} />
          <meta property='og:description' content={this.dict.get('header.tagline')} />
          <meta property='fb:app_id' content='802539780107102' />
        </Head>
        <body tabIndex='-1'>
          <noscript>
            <p>{this.dict.get('app.nojs')}</p>
          </noscript>
          <Main />
          <NextScript />
          <script src='https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.0/jsmediatags.min.js' />
        </body>
      </html>
    )
  }
}
