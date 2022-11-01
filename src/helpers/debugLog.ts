import {ADAHIDE_CONFIG} from '../config'

function debugLog(item) {
  // patched to work with tests, added `ADAHIDE_CONFIG &&`,
  // because config is loaded from html body, which is not present in tests
  if (ADAHIDE_CONFIG && ADAHIDE_CONFIG.ADAHIDE_ENABLE_DEBUGGING) {
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
