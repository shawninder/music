import Events from '../data/Events'

const events = new Events()

export default ({ query, limit }, nextPageToken) => {
  return (_dispatch, getState) => {
    const state = getState()
    return events.search({ query, limit, aggregate: true }, nextPageToken, state.auth.username, state.auth.password)
  }
}
