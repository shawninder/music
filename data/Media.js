const fetch = require('isomorphic-unfetch')
const qs = require('qs')

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
    console.log('Querying YouTube')
    const start = Date.now()
    return fetch(`${process.env.API_URL}?${qs.stringify({
      q: query,
      pageToken: nextPageToken
    })}`)
      .then((results) => {
        return results.json()
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
                  type: 'YouTubeVideo',
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
