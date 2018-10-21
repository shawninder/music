// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import flush from 'styled-jsx/server'
import { guessLang } from '../data/Dict'

export default class MyDocument extends Document {
  static getInitialProps ({ renderPage, req }) {
    // TODO remove everything except the headers and query string stuff, which are the only non-default things I'm trying to do
    const { html, head, errorHtml, chunks } = renderPage()
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    const styles = flush()
    return { html, head, errorHtml, chunks, headers, acceptLanguage, styles }
  }
  render () {
    const lang = guessLang(['en', 'fr'], this.props.acceptLanguage, global.navigator)
    return (
      <html lang={lang}>
        <Head>
          <link rel='shotcut icon' href='/static/favicon.ico' />
          <meta httpEquiv='Content-Language' content={lang} />
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0' />
          <meta name='theme-color' content='#333333' />
          <link rel='manifest' href='/static/manifest.json' />
          <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css' />
        </Head>
        <body tabIndex='-1'>
          <noscript>
            <p>Unfortunately, you need to enable JavaScript to use this app :(</p>
          </noscript>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
