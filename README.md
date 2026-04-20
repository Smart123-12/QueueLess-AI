# QueueLess AI 🏟️

> **Skip the Queue. Enjoy the Game.**

A smart, lightweight AI assistant that helps fans navigate large stadiums efficiently — avoiding crowds, reducing waiting times, and finding the nearest facilities in real time.

---

## 🧩 Problem Statement

Large stadiums hosting 50,000–130,000+ fans face massive operational challenges:

- **Long entry queues** at popular gates
- **Crowded food stalls** causing fans to miss live action
- **Difficulty locating** washrooms and facilities
- **No real-time guidance** for fans inside the venue

These problems result in poor fan experiences, safety risks, and missed moments.

---

## 💡 Solution Overview

**QueueLess AI** is a single-page web application that acts as a smart venue assistant. It uses on-device decision logic (no server required) to:

1. Analyze simulated live crowd data across gates, food stalls, and washrooms
2. Apply a **decision engine** that always surfaces the **best option**
3. Communicate recommendations through a **conversational chatbot UI**
4. Display a **live-updating dashboard** for at-a-glance situational awareness

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat Assistant** | Conversational interface that understands natural language queries |
| 🚪 **Gate Recommendations** | Identifies the least crowded entry gate with estimated wait time |
| 🍔 **Food Stall Guidance** | Ranks food stalls by wait time and surfaces the fastest option |
| 🚻 **Washroom Finder** | Finds the nearest free washroom |
| 📊 **Live Crowd Dashboard** | Color-coded indicators (🟢 Low / 🟡 Medium / 🔴 High) for all facilities |
| 🗺️ **Google Maps Integration** | Embedded live venue map (Narendra Modi Stadium, Ahmedabad) |
| 🔄 **Auto-Refresh Simulation** | Data updates every 30 seconds to simulate real-time changes |
| 📱 **Mobile Responsive** | Fully responsive design for all screen sizes |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS3 (custom properties, grid, flexbox, animations) |
| Logic | Vanilla JavaScript (ES6+, no frameworks) |
| Fonts | Google Fonts (Inter, Space Grotesk) |
| Maps | Google Maps Embed API (iframe) |
| Deployment | Google Cloud Run |

**Total repository size: < 1 MB**
**Zero external JS dependencies**

---

## 🧠 Decision Logic Explanation

The core of QueueLess AI is the **Decision Engine** (`app.js → DecisionEngine`):

### Gate Selection
```
Sort gates by: crowd score (LOW=1, MEDIUM=2, HIGH=3) → entrance time
Return: gate with lowest score + fastest entry
```

### Food Stall Selection
```
Sort food stalls by: waitMinutes (ascending)
Return: stall with minimum wait time
```

### Washroom Selection
```
Filter washrooms where crowdLevel === 'FREE'
Return: first available free washroom (or least busy if all occupied)
```

### Intent Recognition
User messages are matched against a priority-ordered list of **regex patterns**. The first match triggers the corresponding decision handler:
```
/gate|enter|crowd/.test(msg)      → bestGate()
/food|eat|stall/.test(msg)        → bestFoodStall()
/washroom|toilet/.test(msg)       → bestWashroom()
/wait time|all/.test(msg)         → allWaitTimes()
/dashboard|summary/.test(msg)     → dashboardSummary()
```

---

## 🗺️ Google Services Used

| Service | Usage |
|---|---|
| **Google Maps Embed** | Embedded iframe showing Narendra Modi Stadium, Ahmedabad |
| **Google Fonts** | Inter & Space Grotesk for modern typography |
| **Google Cloud Run** | Hosting and deployment of the web application |

---

## 📐 Assumptions (Mock Data)

Since this is a demonstration project, the following data is **simulated**:

- **Gates**: 3 gates with static initial crowd levels (High / Low / Medium)
- **Food Stalls**: 5 stalls with initial wait times (2, 3, 6, 8, 10 minutes)
- **Washrooms**: 4 washrooms with initial status (Free / Busy)
- **Live Updates**: A `DataSimulator` module randomly mutates data every 30 seconds to simulate real IoT sensor feeds

In production, these would be replaced with:
- Real-time crowd counting APIs (camera-based or turnstile sensors)
- POS system integrations for food stall wait times
- Washroom occupancy sensors

---

## 📁 Project Structure

```
QueueLess AI/
├── index.html      # Application shell + all sections
├── style.css       # Complete design system + responsive styles
├── app.js          # Decision engine + chat UI + dashboard + simulator
├── Dockerfile      # Container config for Google Cloud Run
└── README.md       # This file
```

---

## 🚀 Running Locally

Since this is a pure HTML/CSS/JS project, simply open `index.html` in any modern browser — no build step required.

For a local HTTP server (recommended):
```bash
# Python
python -m http.server 8080

# Or Node.js
npx serve .
```

---

## ☁️ Deployment (Google Cloud Run)

The app is containerized using a lightweight **nginx** Docker image:

```bash
# Build and push
docker build -t gcr.io/YOUR_PROJECT/queueless-ai .
docker push gcr.io/YOUR_PROJECT/queueless-ai

# Deploy
gcloud run deploy queueless-ai \
  --image gcr.io/YOUR_PROJECT/queueless-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 👨‍💻 Author

**Smit Parmar**
- GitHub: [@Smart123-12](https://github.com/Smart123-12)
- Google Account: smitparmar280@gmail.com

---

## 📄 License

MIT License — Free to use, modify, and distribute.
