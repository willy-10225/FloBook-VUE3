// 泛型排序函數
export function drySort<T extends Record<string, any>>(
  arr: T[],
  name: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  const canBeParsed = (a: T, b: T, name: keyof T): boolean => {
    return (
      !isNaN(parseInt(String(a[name]))) &&
      parseInt(String(a[name])) == a[name] &&
      !isNaN(parseInt(String(b[name]))) &&
      parseInt(String(b[name])) == b[name]
    )
  }

  return [...arr].sort((a, b) => {
    if (canBeParsed(a, b, name)) {
      return order === "asc"
        ? Number(a[name]) - Number(b[name])
        : Number(b[name]) - Number(a[name])
    } else {
      return order === "asc"
        ? String(a[name]).localeCompare(String(b[name]))
        : String(b[name]).localeCompare(String(a[name]))
    }
  })
}

export function dryCheckIsFile(dragEvent: DragEvent): boolean {
  if (dragEvent.dataTransfer?.types) {
    return Array.from(dragEvent.dataTransfer.types).includes("Files")
  }
  return false
}

export function dryPayloadToQuery(payload: Record<string, any>): string {
  return Object.keys(payload)
    .map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`
    })
    .join("&")
}

export function dryAnsysVersion(versionString: string): number {
  if (versionString === "") return Infinity

  const match2019 = versionString.match(/^2019R(\d+)/)
  if (match2019) return 192 + parseInt(match2019[1])

  const match2020 = versionString.match(/^2020R(\d+)/)
  if (match2020) return 199 + parseInt(match2020[1])

  const numeric = parseFloat(versionString)
  return isNaN(numeric) ? Infinity : numeric * 10
}
