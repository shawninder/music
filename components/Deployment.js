import React, { Component } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import btoa from 'btoa'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Deployment extends Component {
  constructor (props) {
    super(props)
    this.scaleDeployment = this.scaleDeployment.bind(this)
    this.deleteDeployment = this.deleteDeployment.bind(this)
    this.state = {
      msg: '',
      att: ''
    }
  }

  scaleDeployment (deploymentUid) {
    return (event) => {
      console.log('Coming Soon')
      const token = btoa(`${this.props.adminUsername}:${this.props.adminPassword}`)
      fetch(`${process.env.API_URL}/deployments/${deploymentUid}`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${token}`
        },
        body: JSON.stringify({
          scale: {
            min: 1,
            max: 1
          }
        })
      })
        .then((response) => {
          if (response.ok) {
            console.log('SUCCESSFUL SCALE')
            return response.json()
              .then((json) => {
                console.log('json', json)
              })
          } else {
            this.setState({
              msg: 'Error scaling deployment',
              att: JSON.stringify({
                headers: response.headers,
                ok: response.ok,
                redirected: response.redirected,
                status: response.status,
                statusText: response.statusText,
                type: response.type,
                url: response.url
              }, null, 2)
            })
          }
        })
    }
  }

  deleteDeployment (deploymentUid) {
    return (event) => {
      this.props.deleteDeployment(deploymentUid)
        .then((ok) => {
          this.setState({
            msg: 'Successfully deleted deployment',
            att: JSON.stringify({
              uid: deploymentUid
            })
          })
        })
        .catch((reason) => {
          this.setState({
            msg: 'Error deleting deployment',
            att: JSON.stringify({
              headers: reason.headers,
              ok: reason.ok,
              redirected: reason.redirected,
              status: reason.status,
              statusText: reason.statusText,
              type: reason.type,
              url: reason.url
            }, null, 2)
          })
        })
    }
  }

  render () {
    const classes = this.props.className ? this.props.className.split(' ') : []
    classes.push('deployment')
    const date = new Date(this.props.data.created)
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
    const msg = (this.state.msg ? <p>{this.state.msg}</p> : null)
    const att = (this.state.att ? <pre>{this.state.att.toString()}</pre> : null)
    if (this.props.data.scale.current === 0) {
      classes.push('deployment-is-sleeping')
    }
    if (this.props.data.scale.min === 0) {
      classes.push('deployment-may-sleep')
    }
    if (this.props.data.scale.max > 1) {
      classes.push('deployment-may-scale')
    }
    return (
      <div
        className={classes.join(' ')}
      >
        <h3>
          {this.props.data.name} ({this.props.data.state})
          <a className='deployment-link' href={`https://${this.props.data.url}/_src`} target='_blank' title='Visit this deployment'>{this.props.data.url}/_src</a>
        </h3>
        <small className='deployment-created'>Created: {dateStr}</small>
        <small className='deployment-scale'>Scale: {this.props.data.scale.current}[{this.props.data.scale.min}-{this.props.data.scale.max}]</small>
        <div className='deployment-buttons'>
          <button className='deployment-scale-btn' onClick={this.scaleDeployment(this.props.data.key)}>Scale to 1-1</button>
          <button className='deployment-delete' onClick={this.deleteDeployment(this.props.data.key)}>Delete</button>
          {msg}
          {att}
        </div>
        {/* <pre>
          {JSON.stringify(this.props.data)}
        </pre> */}
      </div>
    )
  }
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired }
]

Deployment.defaultProps = defaultProps(props)
Deployment.propTypes = propTypes(props)

export default Deployment
