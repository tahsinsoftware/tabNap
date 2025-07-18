import { useEffect, useState } from "react"

function IndexPopup() {
  const [isOn, setIsOn] = useState(false)
  const [statusMsg, setStatusMsg] = useState("Extension is off ⛔")

  // On load, restore saved state
  useEffect(() => {
    const savedState = localStorage.getItem("tabNapState")
    if (savedState === "on") {
      setIsOn(true)
      sendStatus("START_LOOP")
    }
  }, [])

  const sendStatus = (type: "START_LOOP" | "STOP_LOOP") => {
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type }, (res) => {
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
    setIsOn(newState)

    sendStatus(newState ? "START_LOOP" : "STOP_LOOP")
    localStorage.setItem("tabNapState", newState ? "on" : "off")
  }

  return (
    <div
      style={{
        width: 300,
        height: 250,
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
