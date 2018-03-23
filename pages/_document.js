import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { guessLang } from '../data/Dict'
export default class MyDocument extends Document {
  static getInitialProps ({ renderPage, req }) {
    const { html, head, errorHtml, chunks } = renderPage()
    const headers = req ? req.headers : undefined
    return { html, head, errorHtml, chunks, headers }
  }
  render() {
    const acceptLanguage = this.props.headers ? this.props.headers['accept-language'] : ''
    const lang = guessLang(['en', 'fr', 'es'], acceptLanguage, global.navigator)
    return (
      <html lang={lang}>
        <Head>
          <title>Mass Play</title>
          <link rel="shotcut icon" href="/static/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta name="theme-color" content="black" />
          <link rel="manifest" href="/static/manifest.json" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css" />
          <link rel="stylesheet" href="/_next/static/style.css" />
        </Head>
        <body tabIndex="-1">
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
