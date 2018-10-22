import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import orderBy from 'lodash.orderby'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import Head from '../components/Head'
import List from '../components/List'
import Deployment from '../components/Deployment.js'

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
        <Head title="Crowd's Play | Status" />
        <style jsx global>{`
          .statusPage {
            height: 100%;
            width: 100%;
            padding: 0;
            position: relative;
            background-color: #33333;
            background-image: url('/static/bg.svg');
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-size: 100% 100% !important;
            overflow: scroll;
          }

          .statusPage h2 {
            margin: 15px;
            font-size: 300%;
          }

          .deployment {
            color: black;
            background: whitesmoke;
            margin-bottom: 15px;
            padding: 5px 15px;
          }

          .deploymentList li {
            color: whitesmoke;
          }

          .deployment-scale-btn {
            border: 1px solid cornflowerblue;
            background: whitesmoke;
          }

          .deployment-delete {
            border: 1px solid firebrick;
            background: darkred;
            color: whitesmoke;
          }

          .deployment-link, .deployment-created, .deployment-scale {
            float: right;
          }

          .deployment-may-scale, .deployment-may-sleep, .deployment-may-scale {
            background: chocolate;
          }
        `}</style>
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

export default connect()(Status)
