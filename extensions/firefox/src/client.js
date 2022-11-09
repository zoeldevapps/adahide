/*
Define a function in the content script's scope, then export it
into the page script's scope.
*/
function notify(message) {
  browser.runtime.sendMessage({content: `Function call: ${message}`})
}

exportFunction(notify, window, {defineAs: 'notify'})
