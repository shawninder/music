import React, { useReducer } from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'
import orderBy from 'lodash.orderby'
import btoa from 'btoa'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import Head from '../components/Head'
import List from '../components/List'
import Deployment from '../components/Deployment'
import AuthForm from '../components/AuthForm'

import Store from '../components/Store'
import NoticeContext from '../features/notice/context'
import NoticeList from '../components/NoticeList'

import useNotice from '../features/notice/use'

// const isServer = typeof window === 'undefined'

const initialState = {
  auth: {
    username: null,
    password: null
  }
}

function reducer (state, action) {
  return state
}

function Deployments (props) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [noticeState, noticeDispatch, notify] = useNotice()

  function deleteDeployment (deploymentUid) {
    const token = btoa(`${state.auth.username}:${state.auth.password}`)
    return fetch(`${process.env.API_URL}/deployments/${deploymentUid}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${token}`
      }
    })
      .then((response) => {
        if (response.ok) {
          return true
        } else {
          throw response
        }
      })
  }

  return (
    <Store providers={[
      [NoticeContext, { state: noticeState, dispatch: noticeDispatch, notify }]
    ]}>
      <div className='deploymentsPage'>
        <Head title="Crowd's Play Deployments" />
        <style jsx global>{`
          .deploymentsPage {
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

          .deploymentsPage h2 {
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

          .deployment-is-sleeping, .deployment-may-sleep, .deployment-may-scale {
            background: chocolate;
          }
        `}</style>
        <AuthForm dispatch={dispatch} />
        <h2>Deployments</h2>
        <List
          className='deploymentList'
          defaultComponent={Deployment}
          componentProps={{
            deleteDeployment
          }}
          items={!Array.isArray(props.deployments) // TODO Fix this mess
            ? []
            : orderBy(props.deployments.map((item) => {
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
      <NoticeList
        key='notice-list'
        showing={noticeState.showing.length > 0}
        notices={noticeState.showing}
      />
    </Store>
  )
}

const props = [
  { name: 'deployments', type: PropTypes.array, val: [] }
]

Deployments.defaultProps = defaultProps(props)
Deployments.propTypes = propTypes(props)

export default Deployments
