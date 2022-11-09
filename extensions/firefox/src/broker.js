/*
Show a notification when we get messages from
the content script.
*/
browser.runtime.onMessage.addListener((message) => {
  browser.notifications.create({
    type: 'basic',
    title: 'Message from the page',
    message: message.content,
  })
})

browser.browserAction.onClicked.addListener(async () => {
  const tabs = await browser.tabs.query({url: '*://localhost:*/*'})

  if (!tabs.length) {
    browser.tabs.create({url: 'http://localhost:3000'})
  } else {
    browser.tabs.highlight({tabs: tabs.map((tab) => tab.id)})
  }
})
