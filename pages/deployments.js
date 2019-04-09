import React, { Component } from 'react'
import fetch from 'isomorphic-unfetch'

import Deployments from '../views/Deployments'

class DeploymentsPage extends Component {
  static async getInitialProps ({ req, res }) {
    const url = `${process.env.API_URL}/deployments`
    const response = await fetch(url)
    try {
      const json = await response.json()
      const deployments = json.deployments
      return { deployments }
    } catch (ex) {
      return { deployments: [] }
    }
  }

  render () {
    return <Deployments {...this.props} />
  }
}

export default DeploymentsPage
