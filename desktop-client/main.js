const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron")
const path = require("path")
const usb = require("usb")

// ── Configuration ─────────────────────────────────────────────
// Point this to your deployed Vercel URL (or keep localhost for local dev)
const APP_URL = process.env.APP_URL || "https://eloktantra-api.onrender.com"

let win

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    kiosk: true,
    fullscreen: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
      preload: path.join(__dirname, "preload.js")
    }
  })

  // Load the web app
  win.loadURL(`${APP_URL}/kiosk`)

  // 🚫 Disable dev tools
  win.webContents.on("devtools-opened", () => {
    win.webContents.closeDevTools()
  })

  // 🚫 Block navigation
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith(APP_URL)) {
      e.preventDefault()
    }
  })

  // 🚫 Block new windows
  win.webContents.setWindowOpenHandler(() => {
    return { action: "deny" }
  })

  // 🚫 Detect focus loss (ALT+TAB, etc.)
  win.on("blur", () => {
    if (win) {
      win.webContents.send("violation", "focus_lost")
    }
  })

  // Register global shortcuts to block system navigation
  globalShortcut.register("Alt+Tab", () => {
    console.log("Alt+Tab blocked")
  })
  globalShortcut.register("Alt+F4", () => {
    console.log("Alt+F4 blocked")
  })
  globalShortcut.register("CommandOrControl+W", () => {
    console.log("Closing tab blocked")
  })
  globalShortcut.register("CommandOrControl+R", () => {
    console.log("Refreshing blocked")
  })
  globalShortcut.register("F5", () => {
    console.log("F5 blocked")
  })

  // 🛡️ USB Security: Detect external devices
  usb.on("attach", (device) => {
    console.log("USB attached:", device)
    if (win) {
      win.webContents.send("violation", "external_device_connected")
    }
  })

  usb.on("detach", (device) => {
    console.log("USB detached:", device)
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

app.on("will-quit", () => {
  globalShortcut.unregisterAll()
})
