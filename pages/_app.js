import App, { Container } from 'next/app'
import React from 'react'
import withReduxStore from '../with-redux-store'
import { Provider } from 'react-redux'

class MyApp extends App {
  render () {
    const { Component, pageProps, reduxStore, socket } = this.props
    return (
      <Container>
        <Provider store={reduxStore}>
          <Component {...pageProps} socket={socket} />
        </Provider>
      </Container>
    )
  }
}

export default withReduxStore(MyApp)
