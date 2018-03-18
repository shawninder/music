import React from 'react'

const show = function show (showPlayer) {
  return {
    img: (
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <title>show/hide player</title>
        <path d="M12 9c0-2.761 2.239-5 5-5s5 2.239 5 5c0 2.761-2.239 5-5 5s-5-2.239-5-5zM0 9c0-2.761 2.239-5 5-5s5 2.239 5 5c0 2.761-2.239 5-5 5s-5-2.239-5-5zM24 19v-3c0-1.1-0.9-2-2-2h-20c-1.1 0-2 0.9-2 2v10c0 1.1 0.9 2 2 2h20c1.1 0 2-0.9 2-2v-3l8 5v-14l-8 5zM20 24h-16v-6h16v6z"></path>
      </svg>
    ),
    className: (data) => {
      return showPlayer
        ? 'showPlayerToggle showPlayerToggle--showing'
        : 'showPlayerToggle showPlayerToggle--hiding'
    },
    go: (data, dispatch) => {
      return (event) => {
        event.stopPropagation()
        dispatch({
          type: 'Player:toggleShow'
        })
      }
    }
  }
}

export default show
