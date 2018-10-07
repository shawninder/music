import React, { Component } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import btoa from 'btoa'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Deployment extends Component {
  constructor (props) {
    super(props)
    this.deleteDeployment = this.deleteDeployment.bind(this)
    this.state = {
      msg: '',
      att: ''
    }
  }

  deleteDeployment (deploymentUid) {
    return (event) => {
      const token = btoa(`${this.props.adminUsername}:${this.props.adminPassword}`)
      fetch(`${process.env.API_URL}/deployments/${deploymentUid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${token}`
        }
      })
        .then((response) => {
          if (response.ok) {
            console.log('SUCCESSFUL DELETE')
            return response.json()
              .then((json) => {
                console.log('json', json)
              })
          } else {
            this.setState({
              msg: 'Error deleting deployment',
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

  render () {
    // console.log('this.props.data', this.props.data)
    const classes = this.props.className.split(' ')
    classes.push('deployment')
    const date = new Date(this.props.data.created)
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
    const msg = (this.state.msg ? <p>{this.state.msg}</p> : null)
    const att = (this.state.att ? <pre>{this.state.att.toString()}</pre> : null)
    return (
      <div
        className={classes.join(' ')}
      >
        <h3>
          {this.props.data.name} ({this.props.data.state})
          <a className='deployment-link' href={`https://${this.props.data.url}`} target='_blank' title='Visit this deployment'>{this.props.data.url}</a>
        </h3>
        <small className='deployment-created'>Created: {dateStr}</small>
        <div className='deployment-buttons'>
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
  { name: 'data', type: PropTypes.object.isRequired },
  { name: 'adminUsername', type: PropTypes.string.isRequired },
  { name: 'adminPassword', type: PropTypes.string.isRequired }
]

Deployment.defaultProps = defaultProps(props)
Deployment.propTypes = propTypes(props)

export default Deployment
