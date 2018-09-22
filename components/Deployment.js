import React, { Component } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

class Deployment extends Component {
  constructor (props) {
    super(props)
    this.deleteDeployment = this.deleteDeployment.bind(this)
  }

  deleteDeployment (deploymentUid) {
    return function (event) {
      fetch(`${process.env.API_URL}?delete=${deploymentUid}`)
        .then((response) => {
          console.log('response', response)
          return response.json()
        })
        .then((json) => {
          console.log('json', json)
        })
    }
  }

  render () {
    // console.log('this.props.data', this.props.data)
    const classes = this.props.className.split(' ')
    classes.push('deployment')
    const date = new Date(this.props.data.created)
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
    return (
      <div
        className={classes.join(' ')}
      >
        <h3>{this.props.data.name} ({this.props.data.state})</h3>
        <a href={`https://${this.props.data.url}`} target='_blank' title='Visit this deployment'>{this.props.data.url}</a>
        <br />
        Created: {dateStr}
        <div className='deployment-buttons'>
          <button onClick={this.deleteDeployment(this.props.data.key)}>Delete</button>
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
