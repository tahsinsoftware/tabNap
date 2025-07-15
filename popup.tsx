import { useEffect, useState } from "react"

function IndexPopup() {
  const [isOn, setIsOn] = useState(false)

  // On component load, read from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("tabNapState")
    if (savedState === "on") {
      setIsOn(true)
      // Also tell background to start loop if not already
      if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: "START_LOOP" }, (res) => {
          console.log("Restored ON state:", res)
        })
      }
    }
  }, [])

  const handleToggle = () => {
    setIsOn((prev) => {
      const newState = !prev
      console.log(newState ? "ON clicked" : "OFF clicked")

      if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          { type: newState ? "START_LOOP" : "STOP_LOOP" },
          (res) => {
            console.log("Background response:", res)
          }
        )
      }

      // Save to localStorage
      localStorage.setItem("tabNapState", newState ? "on" : "off")

      return newState
    })
  }

  return (
    <div
      style={{
        width: 300,
        height: 250,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: "sans-serif"
      }}>
      <h2>Welcome to Tab Nap, turn on for the feature</h2>

      <button
        onClick={handleToggle}
        style={{
          padding: "8px 16px",
          backgroundColor: isOn ? "#4caf50" : "#f44336",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}>
        {isOn ? "ON" : "OFF"}
      </button>
    </div>
  )
}

export default IndexPopup
