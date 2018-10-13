import React, { Component } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import orderBy from 'lodash.orderby'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import List from '../components/List'
import Deployment from '../components/Deployment.js'
import '../styles/status.css'

// const isServer = typeof window === 'undefined'

class Status extends Component {
  constructor (props) {
    super(props)
    this.usernameChanged = this.usernameChanged.bind(this)
    this.passwordChanged = this.passwordChanged.bind(this)
  }
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

  usernameChanged (event) {
    const action = {
      type: 'Auth:setUsername',
      value: event.target.value
    }
    this.props.dispatch(action)
  }

  passwordChanged (event) {
    this.props.dispatch({
      type: 'Auth:setPassword',
      value: event.target.value
    })
  }

  render () {
    // console.log('this.props.deployments', this.props.deployments)
    return (
      <div className='statusPage'>
        <form className='authForm'>
          <label>Username: </label>
          <input type='text' onChange={this.usernameChanged} />
          <label>Password: </label>
          <input type='password' onChange={this.passwordChanged} />
        </form>
        <h2>Deployments</h2>
        <List
          className='deploymentList'
          defaultComponent={Deployment}
          componentProps={{
            deleteDeployment: this.props.deleteDeployment
          }}
          items={!Array.isArray(this.props.deployments) // TODO Fix this mess
            ? []
            : orderBy(this.props.deployments.map((item) => {
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
              return data
            }), 'created', 'desc')}
        />
      </div>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'deleteDeployment', type: PropTypes.func.isRequired }
]

Status.defaultProps = defaultProps(props)
Status.propTypes = propTypes(props)

export default Status
