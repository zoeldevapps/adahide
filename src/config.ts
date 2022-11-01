const dataConfigString = document.body.getAttribute('data-config') || '{}'
const ADAHIDE_CONFIG = JSON.parse(dataConfigString)

export {ADAHIDE_CONFIG}
