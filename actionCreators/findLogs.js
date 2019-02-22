import Events from '../data/Events'

const events = new Events()

export default ({ query, limit }, nextPageToken) => {
  return (_dispatch, getState) => {
    const state = getState()
    console.log('events.search', query, `limit: ${limit}`)
    return events.search({ query, limit }, nextPageToken, state.auth.username, state.auth.password)
  }
}
