import App, { Container } from 'next/app'
import React from 'react'

import Dict from '../data/Dict'
import DictContext from '../features/dict/context'

import txt from '../data/txt.json'

class MyApp extends App {
  // static async getInitialProps ({ Component, ctx }) {
  //   const pageProps = Component.getInitialProps
  //     ? await Component.getInitialProps(ctx)
  //     : {}
  //   return { pageProps }
  // }

  render () {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <DictContext.Provider
          value={{
            dict: new Dict(txt, ['en', 'fr'], this.props.acceptLanguage, global.navigator)
          }}
        >
          <Component {...pageProps} />
        </DictContext.Provider>
      </Container>
    )
  }
}

export default MyApp
