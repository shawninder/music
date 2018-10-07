import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import List from '../components/List'
import Log from '../components/Log'
import '../styles/logs.css'

// const isServer = typeof window === 'undefined'

class Logs extends Component {
  render () {
    // console.log('this.props.deployments', this.props.deployments)
    return (
      <div className='logsPage'>
        <form className='authForm'>
          <label>Username: </label>
          <input type='text' />
          <label>Password: </label>
          <input type='password' />
        </form>
        <h2>Logs</h2>
        <List
          className='logList'
          defaultComponent={Log}
          componentProps={{
            // adminUsername: this.state.username,
            // adminPassword: this.state.password
          }}
          items={[]}
        />
      </div>
    )
  }
}

const props = [

]

Logs.defaultProps = defaultProps(props)
Logs.propTypes = propTypes(props)

export default Logs
