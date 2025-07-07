export function drySort(obj, name, order) {
  obj = obj.sort((a, b) => {
    if (canBeParsed(a, b, name)) {
      if (order == 'asc') {
        return a[name] - b[name]
      } else {
        return b[name] - a[name]
      }
    } else {
      if (order == 'asc') {
        return a[name] > b[name] ? 1 : -1
      } else {
        return a[name] < b[name] ? 1 : -1
      }
    }
  })

  function canBeParsed(a, b, name) {
    return parseInt(a[name]) == a[name] && parseInt(b[name]) == b[name]
  }
}

export function dryCheckIsFile(dragEvent) {
  if (dragEvent.dataTransfer.types) {
    for (var i = 0; i < dragEvent.dataTransfer.types.length; i++) {
      if (dragEvent.dataTransfer.types[i] == 'Files') {
        return true
      }
    }
  }
  return false
}

export function dryPayloadToQuery(payload) {
  let query = Object.keys(payload)
    .map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(payload[key])
    })
    .join('&')
  return query
}

export function dryAnsysVersion(versionString) {
  if (versionString == '') {
    return Infinity
  } else if (versionString.match('2019R')) {
    return 192 + parseInt(versionString.split('R')[1])
  } else if (versionString.match('2020R')) {
    return 199 + parseInt(versionString.split('R')[1])
  } else {
    return versionString * 10
  }
}
