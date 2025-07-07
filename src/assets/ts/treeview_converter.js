function convertTreeView(arr) {
  const treeview = []
  for (let i = 0; i < arr.length; i++) {
    pushToFolder(treeview, arr[i])
  }
  return treeview
}

function isInFolder(path) {
  return path.match(/\//g).length > 1
}

function getFolderName(path) {
  return path.match(/\/(?<name>.*?)\//).groups.name
}

function getEntryName(path) {
  let layers = path.split('/').filter(x => x != '')
  return layers[layers.length - 1]
}

function getSubPath(path) {
  let pathRemovedFirstSlash = path.slice(1)
  return pathRemovedFirstSlash.slice(pathRemovedFirstSlash.indexOf('/'))
}

function getSubFolderEntry(folder, subFolderName) {
  return folder.find(entry => entry.name == subFolderName)
}

function pushToFolder(folder, path) {
  if (isInFolder(path)) {
    let subFolderName = getFolderName(path)
    let subFolderEntry = getSubFolderEntry(folder, subFolderName)
    if (subFolderEntry) {
      let subPath = getSubPath(path)
      return pushToFolder(subFolderEntry.children, subPath)
    } else {
      const entry = {}
      entry.name = subFolderName
      entry.children = []
      folder.push(entry)
    }
  } else {
    const entry = {}
    entry.name = getEntryName(path)
    folder.push(entry)
  }
}

export default {
  isInFolder,
  getFolderName,
  getEntryName,
  getSubPath,
  getSubFolderEntry,
  convertTreeView
}
