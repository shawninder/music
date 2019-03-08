const btoa = require('btoa')
const fetch = require('isomorphic-unfetch')
const qs = require('querystring')

class Events {
  search ({ query, limit = 10, aggregate = false }, nextPageToken, adminUsername, adminPassword) {
    // Look in memory
    // Look in local and session storage
    // Look in network
    // Look online
    const start = Date.now()
    const token = btoa(`${adminUsername}:${adminPassword}`)
    return fetch(`${process.env.API_URL}/${aggregate ? 'aggs' : 'logs'}?${qs.stringify({
      q: query,
      l: limit,
      pageToken: nextPageToken
    })}`, {
      headers: {
        Authorization: `Basic ${token}`
      }
    })
      .then((results) => {
        if (results.status === 204) {
          return { error: 'No Results!?' }
        } else if (results.ok) {
          return results.json()
        } else {
          return {
            error: 'Not OK'
          }
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
