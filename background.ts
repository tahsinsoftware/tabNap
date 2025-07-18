const tabIdleMap: Record<number, number> = {}

let loopRunning = false
let loopInterval: NodeJS.Timeout

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_LOOP") {
    if (!loopRunning) {
      console.log("🟢 Tab checker loop started...")
      loopRunning = true

      loopInterval = setInterval(() => {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (!tab.id) return

            if (tab.pinned) return

            if (tab.active || tab.audible) {
              tabIdleMap[tab.id] = 0
            } else {
              tabIdleMap[tab.id] = (tabIdleMap[tab.id] || 0) + 1

              if (tabIdleMap[tab.id] >= 5 && !tab.discarded) {
                chrome.tabs.discard(tab.id)
              }
            }
          })
        })
      }, 60_000)
    }

    sendResponse({ status: "loop started" })
    return true
  }

  if (message.type === "STOP_LOOP") {
    if (loopRunning) {
      clearInterval(loopInterval)
      loopRunning = false
      console.log("🔴 Tab checker loop stopped.")
    }

    sendResponse({ status: "loop stopped" })
    return true
  }

  return false
})
