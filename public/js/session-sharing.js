cloneSessionStorage()
/**
 * Share sessionStorage in multi-tabs
 */
function cloneSessionStorage() {
  if (!window.sessionStorage.length) {
    window.localStorage.setItem('getSessionStorageData', Date.now())
  }
  window.addEventListener('storage', function (event) {
    if (event.key === 'getSessionStorageData') {
      window.localStorage.setItem(
        'sessionStorageData',
        JSON.stringify(window.sessionStorage)
      )
      window.localStorage.removeItem('sessionStorageData')
      window.localStorage.removeItem('getSessionStorageData')
    }
    if (event.key === 'sessionStorageData' && !window.sessionStorage.length) {
      var data = JSON.parse(event.newValue)
      for (var key in data) {
        window.sessionStorage.setItem(key, data[key])
      }
    }
    if (event.key === 'logout') {
      window.sessionStorage.clear()
      window.location.reload()
    }
  })
}
