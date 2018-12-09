const fetch = require('isomorphic-unfetch')
const qs = require('querystring')

class Media {
  live (query) {
    return Promise.resolve([])
  }

  isPlayable (item) {
    return item && item.id && !!item.id.videoId
  }

  search (query, nextPageToken) {
    // Look in memory
    // Look in local and session storage
    // Look in network
    // Look online
    const start = Date.now()
    return fetch(`${process.env.API_URL}/media?${qs.stringify({
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
          console.error("Can't get YouTube search results", data.error)
          return {
            items: [],
            hasMore: false,
            prevPageToken: null,
            nextPageToken: null
          }
        } else {
          console.log(`Got results from YouTube in ${Date.now() - start}ms`)
          return {
            items: data.items.reduce((acc, item) => {
              if (this.isPlayable(item)) {
                acc.push({
                  type: 'YouTube',
                  key: item.id.videoId,
                  ...item
                })
              }
              return acc
            }, []),
            hasMore: data.pageInfo.totalResults > data.pageInfo.resultsPerPage,
            prevPageToken: data.prevPageToken,
            nextPageToken: data.nextPageToken
          }
        }
      })
  }
}

module.exports = Media
