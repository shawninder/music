import url from 'url'
import qs from 'querystring'

import React, { Component } from 'react'

import AppComponent from '../components/App'

class App extends Component {
  static getInitialProps ({ req, res }) {
    const headers = req ? req.headers : undefined
    const acceptLanguage = headers ? headers['accept-language'] : ''
    const linkedPartyName = req ? qs.parse(url.parse(req.url).query).name : undefined
    return { headers, acceptLanguage, linkedPartyName }
  }
  render () {
    return <AppComponent {...this.props} />
  }
}

export default App
