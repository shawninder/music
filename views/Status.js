import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import orderBy from 'lodash.orderby'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import List from '../components/List'
import Deployment from '../components/Deployment.js'
import '../styles/status.css'

// const isServer = typeof window === 'undefined'

class Status extends Component {
  static async getInitialProps ({ req, res }) {
    const url = `${process.env.API_URL}/deployments`
    const response = await fetch(url)
    const json = await response.json()
    const deployments = json.deployments
    return { deployments }
  }
  render () {
    // console.log('this.props.deployments', this.props.deployments)
    return (
      <div className='statusPage'>
        <h2>Deployments</h2>
        <List
          className='deploymentList'
          defaultComponent={Deployment}
          items={!Array.isArray(this.props.deployments) // TODO Fix this mess
            ? []
            : orderBy(this.props.deployments.map((item) => {
              console.log('item', item)
              const data = {
                key: item.uid,
                name: item.name,
                url: item.url,
                created: item.created,
                state: item.state,
                type: item.type,
                creator: item.creator,
                scale: item.scale
              }
              console.log('data', data)
              return data
            }), 'created', 'desc')}
        />
      </div>
    )
  }
}

const props = []

Status.defaultProps = defaultProps(props)
Status.propTypes = propTypes(props)

export default Status
