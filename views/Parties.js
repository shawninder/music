import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import List from '../components/List'
import PartyStats from '../components/PartyStats.js'
import '../styles/status.css'

// const isServer = typeof window === 'undefined'

class Parties extends Component {
  render () {
    return (
      <div className='partiesPage'>
        <h2>Parties</h2>
        <List
          className='partyList'
          defaultComponent={PartyStats}
          items={[]}
        />
      </div>
    )
  }
}

const props = []

Parties.defaultProps = defaultProps(props)
Parties.propTypes = propTypes(props)

export default Parties
