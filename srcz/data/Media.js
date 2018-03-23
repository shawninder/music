const fetch = require('isomorphic-unfetch')
const qs = require('qs')
const secrets = require('../../.secret')

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
    return fetch(`https://www.googleapis.com/youtube/v3/search?${qs.stringify({
      maxResults: '25',
      part: 'snippet',
      q: query,
      type: '',
      key: secrets.youtubeKey
    })}`)
      .then((results) => {
        return results.json()
      })
      .then((data) => {
        console.log(`Got results from YouTube in ${Date.now() - start}ms`)
        return data.items.filter(this.isPlayable)
      })
  }
}

module.exports =  Media
