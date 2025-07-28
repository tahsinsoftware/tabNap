const tabIdleMap: Record<number, number> = {}
let loopRunning = false
let loopInterval: NodeJS.Timeout
let ignoredSites: string[] = []

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log("[Background] Received message:", message)

  if (message.type === "START_LOOP") {
    if (!loopRunning) {
      console.log("🟢 [Background] Tab checker loop started")
      loopRunning = true

      loopInterval = setInterval(() => {
        chrome.tabs.query({}, (tabs) => {
          // console.log(`[Background] Scanning ${tabs.length} tabs`)
          tabs.forEach((tab) => {
            if (!tab.id) return
            if (tab.pinned) return

            const url = tab.url || ""
            const isIgnored = ignoredSites.some((site) => url.includes(site))

            if (tab.active || tab.audible) {
              tabIdleMap[tab.id] = 0
            } else if (!isIgnored) {
              tabIdleMap[tab.id] = (tabIdleMap[tab.id] || 0) + 1
              // console.log(`[Tab ${tab.id}] Idle ${tabIdleMap[tab.id]} minute(s)`)

              if (tabIdleMap[tab.id] >= 5 && !tab.discarded) {
                console.log(`[Tab ${tab.id}] Discarding due to 5 min idle`)
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
      console.log("🔴 [Background] Tab checker loop stopped.")
    }

    sendResponse({ status: "loop stopped" })
    return true
  }

  if (message.type === "UPDATE_IGNORED_SITES") {
    ignoredSites = message.sites || []
    // console.log("[Background] Updated ignoredSites:", ignoredSites)
    return true
  }

  return false
})
