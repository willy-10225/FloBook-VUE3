export interface TreeNode {
  name: string
  children?: TreeNode[]
}

function isInFolder(path: string): boolean {
  return (path.match(/\//g) || []).length > 1
}

function getFolderName(path: string): string {
  const match = path.match(/\/(?<name>.*?)\//)
  return match?.groups?.name ?? ""
}

function getEntryName(path: string): string {
  let layers = path.split("/").filter(x => x != "")
  return layers[layers.length - 1]
}

function getSubPath(path: string): string {
  let pathRemovedFirstSlash = path.slice(1)
  return pathRemovedFirstSlash.slice(pathRemovedFirstSlash.indexOf("/"))
}

function getSubFolderEntry(
  folder: TreeNode[],
  subFolderName: string
): TreeNode | undefined {
  return folder.find(entry => entry.name == subFolderName)
}

function pushToFolder(folder: TreeNode[], path: string): void {
  if (isInFolder(path)) {
    const subFolderName = getFolderName(path)
    let subFolderEntry = getSubFolderEntry(folder, subFolderName)
    if (!subFolderEntry) {
      subFolderEntry = { name: subFolderName, children: [] }
      folder.push(subFolderEntry)
    }
    const subPath = getSubPath(path)
    pushToFolder(subFolderEntry.children!, subPath)
  } else {
    folder.push({ name: getEntryName(path) })
  }
}

function convertTreeView(arr) {
  const treeview = []
  for (let i = 0; i < arr.length; i++) {
    pushToFolder(treeview, arr[i])
  }
  return treeview
}

export default {
  isInFolder,
  getFolderName,
  getEntryName,
  getSubPath,
  getSubFolderEntry,
  convertTreeView,
}
