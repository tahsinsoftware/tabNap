import { useEffect, useState } from "react"

function IndexPopup() {
  const [isOn, setIsOn] = useState(false)
  const [statusMsg, setStatusMsg] = useState("Extension is off ⛔")
  const [showSettings, setShowSettings] = useState(false)
  const [siteInput, setSiteInput] = useState("")
  const [ignoredSites, setIgnoredSites] = useState<string[]>([])

  useEffect(() => {
    // console.log("[Popup] useEffect: Initializing popup")

    const savedState = localStorage.getItem("tabNapState")
    // console.log("[Popup] Restored tabNapState:", savedState)
    if (savedState === "on") {
      setIsOn(true)
      sendStatus("START_LOOP")
    }

    const savedSites = JSON.parse(localStorage.getItem("ignoredSites") || "[]")
    // console.log("[Popup] Loaded ignored sites:", savedSites)
    setIgnoredSites(savedSites)
  }, [])

  const sendStatus = (type: "START_LOOP" | "STOP_LOOP") => {
    // console.log(`[Popup] Sending message to background: ${type}`)

    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type }, (res) => {
        // console.log("[Popup] Background response:", res)
        if (res?.status === "loop started") {
          setStatusMsg("Extension is running ✅")
        } else if (res?.status === "loop stopped") {
          setStatusMsg("Extension is off ⛔")
        } else {
          setStatusMsg("Extension status unknown ❓")
        }
      })
    }
  }

  const handleToggle = () => {
    const newState = !isOn
    // console.log(`[Popup] handleToggle: Setting state to ${newState ? "ON" : "OFF"}`)
    setIsOn(newState)

    sendStatus(newState ? "START_LOOP" : "STOP_LOOP")
    localStorage.setItem("tabNapState", newState ? "on" : "off")
    // console.log("[Popup] Saved tabNapState to localStorage:", newState ? "on" : "off")
  }

  const extractDomain = (url: string) => {
    try {
      const u = new URL(url)
      return u.hostname.replace("www.", "").split(".")[0]
    } catch {
      // console.warn(`[Popup] Invalid URL passed to extractDomain: ${url}`)
      return ""
    }
  }

  const handleAddSite = () => {
    const trimmed = siteInput.trim()
    if (!trimmed) return

    const updated = [...ignoredSites, trimmed]
    setIgnoredSites(updated)
    localStorage.setItem("ignoredSites", JSON.stringify(updated))

    chrome.runtime.sendMessage({ type: "UPDATE_IGNORED_SITES", sites: updated })
    setSiteInput("")
  }

  const handleRemoveSite = (site: string) => {
    const updated = ignoredSites.filter((s) => s !== site)
    setIgnoredSites(updated)
    localStorage.setItem("ignoredSites", JSON.stringify(updated))

    chrome.runtime.sendMessage({ type: "UPDATE_IGNORED_SITES", sites: updated })
  }


  return (
    <div
      style={{
        width: 300,
        height: 400,
        padding: 16,
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
          Tab Nap 💤
        </h2>

        <p style={{ fontSize: 14, marginBottom: 16 }}>
          Automatically discards inactive tabs to save memory.
        </p>

        <p
          style={{
            padding: 8,
            borderRadius: 4,
            background: isOn ? "#e8f5e9" : "#ffebee",
            color: isOn ? "#2e7d32" : "#c62828",
            fontWeight: 500
          }}
        >
          {statusMsg}
        </p>

        <button
          onClick={() => {
            setShowSettings((s) => !s)
            console.log("[Popup] Toggled settings section:", !showSettings ? "shown" : "hidden")
          }}
          style={{
            marginTop: 10,
            fontSize: 14,
            cursor: "pointer",
            background: "none",
            border: "none",
            color: "#1976d2"
          }}
        >
          {showSettings ? "Hide Settings ▲" : "See More Settings ▼"}
        </button>

        {showSettings && (
          <div style={{ marginTop: 12 }}>
            <input
              value={siteInput}
              onChange={(e) => setSiteInput(e.target.value)}
              placeholder="https://example.com"
              style={{
                padding: 6,
                width: "100%",
                borderRadius: 4,
                border: "1px solid #ccc",
                marginBottom: 8
              }}
            />
            <button
              onClick={handleAddSite}
              style={{
                padding: "6px 10px",
                fontSize: 14,
                backgroundColor: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                width: "100%"
              }}
            >
              Save Site
            </button>

            <ul style={{
              marginTop: 10,
              padding: 0,
              listStyle: "none",
              maxHeight: 80,
              overflowY: "auto"
            }}>
              {ignoredSites.map((site) => (
                <li key={site} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4
                }}>
                  <span>{extractDomain(site)}</span>
                  <button
                    onClick={() => handleRemoveSite(site)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#c62828",
                      cursor: "pointer",
                      fontSize: 16
                    }}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={handleToggle}
        style={{
          padding: "10px 16px",
          backgroundColor: isOn ? "#4caf50" : "#f44336",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer"
        }}
      >
        {isOn ? "Turn OFF" : "Turn ON"}
      </button>
    </div>
  )
}

export default IndexPopup
