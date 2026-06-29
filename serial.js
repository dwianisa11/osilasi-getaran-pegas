// ================= STATE =================
let serialPort = null;
let reader = null;
let writer = null;
let keepReading = false;

// ================= CONNECT =================
async function connect() {
  try {
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 115200 });

    // ----- Reader -----
    const decoder = new TextDecoderStream();
    serialPort.readable.pipeTo(decoder.writable);
    reader = decoder.readable.getReader();

    // ----- Writer -----
    const encoder = new TextEncoderStream();
    encoder.readable.pipeTo(serialPort.writable);
    writer = encoder.writable.getWriter();

    keepReading = true;
    setStatus("Connected");

    readSerial();
  } catch (err) {
    console.error("Serial connect error:", err);
    setStatus("Error");
  }
}

// ================= READ =================
async function readSerial() {
  let buffer = "";

  try {
    while (keepReading) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        parseLine(line.trim());
      }
    }
  } catch (err) {
    console.error("Serial read error:", err);
  }
}

// ================= PARSE =================
function parseLine(text) {
  if (!text) return;
  if (text.startsWith("#")) return;

  const parts = text.split(",");
  if (parts.length < 2) return;

  const time = Number(parts[0]);
  const distance = Number(parts[1]);

  if (isNaN(time) || isNaN(distance)) return;

  // Update UI
  const xEl = document.getElementById("xValue");
  if (xEl) xEl.textContent = distance.toFixed(2);

  // Kirim ke realtime system
  if (typeof handleRealtimeData === "function") {
    handleRealtimeData(time, distance);
  }
}

// ================= SEND =================
async function sendCommand(cmd) {
  if (!writer) {
    console.warn("Serial belum connect");
    return;
  }
  await writer.write(cmd);
}

// ================= DISCONNECT =================
async function disconnect() {
  keepReading = false;
  try {
    if (reader) reader.releaseLock();
    if (writer) writer.releaseLock();
    if (serialPort) await serialPort.close();
  } catch (e) {
    console.warn(e);
  }
  setStatus("Disconnected");
}

// ================= UI =================
function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text;
}

// ================= EXPORT =================
window.connect = connect;
window.disconnect = disconnect;
window.sendCommand = sendCommand;
