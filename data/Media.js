const fetch = require('isomorphic-unfetch')
const qs = require('qs')

class Media {
  live (query) {
    return Promise.resolve([])
  }

  isPlayable (item) {
    return item && item.id && !!item.id.videoId
  }

  search (query) {
    // Look in memory
    // Look in local and session storage
    // Look in network
    // Look online
    console.log('Querying YouTube')
    const start = Date.now()
    return fetch(`${process.env.YOUTUBE_SEARCH_URL}?${qs.stringify({
      q: query
    })}`)
      .then((results) => {
        return results.json()
      })
      .then((data) => {
        if (data.error) {
          console.error("Can't get YouTube search results", data.error)
          return []
        } else {
          console.log(`Got results from YouTube in ${Date.now() - start}ms`)
          return data.items.filter(this.isPlayable)
        }
      })
  }
}

module.exports = Media
