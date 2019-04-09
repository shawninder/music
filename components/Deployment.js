import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import btoa from 'btoa'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import NoticeContext from '../features/notice/context'

function Deployment (props) {
  const [msg, setMsg] = useState('')
  const [att, setAtt] = useState('')

  const { notify } = useContext(NoticeContext)

  function scaleDeployment (deploymentUid) {
    return (event) => {
      console.log('Coming Soon')
      const token = btoa(`${props.adminUsername}:${props.adminPassword}`)
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
            setMsg('Error scaling deployment')
            setAtt(JSON.stringify({
              headers: response.headers,
              ok: response.ok,
              redirected: response.redirected,
              status: response.status,
              statusText: response.statusText,
              type: response.type,
              url: response.url
            }, null, 2))
          }
        })
    }
  }

  function deleteDeployment (deploymentUid) {
    return (event) => {
      props.deleteDeployment(deploymentUid)
        .then((ok) => {
          notify({
            id: `deleted-${deploymentUid}`,
            body: `Successfully deleted deployment ${JSON.stringify({ uid: deploymentUid })}`
          })
          setMsg('Successfully deleted deployment')
          setAtt(JSON.stringify({
            uid: deploymentUid
          }))
        })
        .catch((reason) => {
          notify({
            id: `couldnt-delete-${deploymentUid}`,
            body: `Error deleting deployment ${JSON.stringify({
              headers: reason.headers,
              ok: reason.ok,
              redirected: reason.redirected,
              status: reason.status,
              statusText: reason.statusText,
              type: reason.type,
              url: reason.url
            }, null, 2)}`
          })
          setMsg('Error deleting deployment')
          setAtt(JSON.stringify({
            headers: reason.headers,
            ok: reason.ok,
            redirected: reason.redirected,
            status: reason.status,
            statusText: reason.statusText,
            type: reason.type,
            url: reason.url
          }, null, 2))
        })
    }
  }

  const classes = props.className ? props.className.split(' ') : []
  classes.push('deployment')
  const date = new Date(props.data.created)
  const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
  const msgFragment = (msg ? <p>{msg}</p> : null)
  const attFragment = (att ? <pre>{att.toString()}</pre> : null)
  if (props.data.scale.current === 0) {
    classes.push('deployment-is-sleeping')
  }
  if (props.data.scale.min === 0) {
    classes.push('deployment-may-sleep')
  }
  if (props.data.scale.max > 1) {
    classes.push('deployment-may-scale')
  }
  return (
    <div
      className={classes.join(' ')}
    >
      <h3>
        {props.data.name} ({props.data.state})
        <a className='deployment-link' href={`https://${props.data.url}/_src`} target='_blank' title='Visit this deployment'>{props.data.url}/_src</a>
      </h3>
      <small className='deployment-created'>Created: {dateStr}</small>
      <small className='deployment-scale'>Scale: {props.data.scale.current}[{props.data.scale.min}-{props.data.scale.max}]</small>
      <div className='deployment-buttons'>
        <button className='deployment-scale-btn' onClick={scaleDeployment(props.data.key)}>Scale to 1-1</button>
        <button className='deployment-delete' onClick={deleteDeployment(props.data.key)}>Delete</button>
        {msgFragment}
        {attFragment}
      </div>
      {/* <pre>
        {JSON.stringify(props.data)}
      </pre> */}
    </div>
  )
}

const props = [
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'data', type: PropTypes.object.isRequired }
]

Deployment.defaultProps = defaultProps(props)
Deployment.propTypes = propTypes(props)

export default Deployment
