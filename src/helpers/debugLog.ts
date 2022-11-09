function debugLog(item) {
  if (import.meta.env.DEV) {
    let msgToLog = ''
    if (item instanceof Error) {
      msgToLog = JSON.stringify(item, Object.getOwnPropertyNames(item))
    } else {
      msgToLog = item
    }
    // eslint-disable-next-line no-console
    console.error(msgToLog)
  }
}

export default debugLog
