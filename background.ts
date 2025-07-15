const tabIdleMap: Record<number, number> = {} // tabId => minutesInactive

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
            if (tab.active || tab.audible) {
              // Reset timer if tab is active or playing audio
              tabIdleMap[tab.id] = 0
            } else {
              tabIdleMap[tab.id] = (tabIdleMap[tab.id] || 0) + 1

              console.log(
                `🕐 Tab ${tab.id} inactive for ${tabIdleMap[tab.id]} minute(s)`
              )

              if (tabIdleMap[tab.id] >= 5 && !tab.discarded) {
                chrome.tabs.discard(tab.id)
                console.log(`❌ Discarded tab ${tab.id} after 5 mins`)
              }
            }
          })
        })
      }, 60_000) // every 1 min
    }

    sendResponse({ status: "loop started" })
  }

  return true
})
