import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { guessLang } from '../data/Dict'
export default class MyDocument extends Document {
  static getInitialProps ({ renderPage, req }) {
    // TODO remove everything except the headers stuff, which is the only non-default thing I'm trying to do
    const { html, head, errorHtml, chunks } = renderPage()
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    return { html, head, errorHtml, chunks, headers, acceptLanguage }
  }
  render () {
    const lang = guessLang(['en', 'fr', 'es'], this.props.acceptLanguage, global.navigator)
    return (
      <html lang={lang}>
        <Head>
          <title>Mass Play</title>
          <link rel='shotcut icon' href='/static/favicon.ico' />
          <meta httpEquiv='Content-Language' content={lang} />
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0' />
          <meta name='theme-color' content='whitesmoke' />
          <link rel='manifest' href='/static/manifest.json' />
          <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css' />
          <link rel='stylesheet' href='/_next/static/style.css' />
        </Head>
        <body tabIndex='-1'>
          <noscript>
            <p>You need to enable JavaScript to use this app :(</p>
          </noscript>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
