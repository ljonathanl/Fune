export default {
  mounted: (el, binding) => {
    const delay = 200
    const interval = 50
    if (typeof binding.value !== 'function') {
      return
    }

    let pressTimer = null
    let pressInterval = null

    const start = (e) => {
      console.log("start " + e.type)
      if (e.type === 'click' && e.button !== 0) {
        return
      }

      e.preventDefault();

      if (pressTimer === null) {
        handler()
        pressTimer = setTimeout(() => {
          if (interval && interval > 0) {
            pressInterval = setInterval(() => {
              handler()
            }, interval)
          }
          handler()
        }, delay)
      }
    }

    // Cancel Timeout
    const cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
      if (pressInterval) {
        clearInterval(pressInterval)
        pressInterval = null
      }
    }
    // Run Function
    const handler = (e) => {
      binding.value(e)
    }

    ;['mousedown', 'touchstart'].forEach(e => el.addEventListener(e, start))
    ;['click', 'mouseout', 'touchend', 'touchcancel'].forEach(e => el.addEventListener(e, cancel))
}
}