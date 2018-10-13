const fetch = require('isomorphic-unfetch')
const qs = require('querystring')

class Events {
  search (query, nextPageToken) {
    // Look in memory
    // Look in local and session storage
    // Look in network
    // Look online
    const start = Date.now()
    console.log('GET', `${process.env.API_URL}/logs?${qs.stringify({
      q: query,
      pageToken: nextPageToken
    })}`)
    return fetch(`${process.env.API_URL}/logs?${qs.stringify({
      q: query,
      pageToken: nextPageToken
    })}`)
      .then((results) => {
        if (results.status === 204) {
          return { error: 'No Results!?' }
        } else {
          return results.json()
        }
      })
      .then((data) => {
        if (data.error) {
          console.error("Can't get Logs", data.error)
          return {
            items: [],
            hasMore: false,
            prevPageToken: null,
            nextPageToken: null
          }
        } else {
          console.log(`Got logs in ${Date.now() - start}ms`)
          return {
            items: data.map((item) => {
              return {
                type: 'LogEntry',
                key: item._id,
                ...item
              }
            }),
            // hasMore: data.pageInfo.totalResults > data.pageInfo.resultsPerPage,
            hasMore: false,
            prevPageToken: data.prevPageToken,
            nextPageToken: data.nextPageToken
          }
        }
      })
  }
}

module.exports = Events
