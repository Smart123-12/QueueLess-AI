# QueueLess AI 🏟️

> **Skip the Queue. Enjoy the Game.**

A production-quality, lightweight AI assistant designed to help fans navigate large stadiums efficiently — avoiding crowds, reducing waiting times, and finding the nearest facilities in real-time.

---

## 🧩 Problem Statement

Large stadiums hosting 50,000–130,000+ fans face massive operational challenges:
- **Long entry queues** at popular gates leading to frustration.
- **Crowded food stalls** causing fans to wait and miss live action.
- **Navigation issues**, making it difficult to locate washrooms and facilities quickly.
- **Lack of real-time guidance** dynamically adjusting to current stadium conditions.

---

## 💡 Solution Overview

**QueueLess AI** is a smart venue assistant that solves these issues using a dynamic decision engine.
It leverages logical reasoning based on real-time simulated data to compute the best options for fans.
The app provides a natural chatbot interface, a live dynamic dashboard, and real-time mapping for a seamless experience.

---

## ✨ Features

- 🤖 **Smart AI Assistant:** Chat interface that understands keywords (gate, food, washroom) and responds with logical recommendations.
- 🧠 **Intelligent Decision Engine:** Calculates the BEST option (lowest crowd / shortest wait) and explains the reasoning precisely.
- 📊 **Real-Time Crowd Dashboard:** Color-coded (🔴 High | 🟡 Medium | 🟢 Low) indicators showing dynamic wait times and crowd levels.
- 🗺️ **Google Maps Integration:** Embedded "Live Venue Map (Google Maps)" to help users visualize the stadium layout.
- 📱 **Mobile Responsive & Accessible:** Clean UI, fast performance, semantic elements, and secure inputs `<input aria-label="Ask about crowd and queues">`.

---

## 🛠️ Tech Stack

Built under strict constraints:
- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Size:** Extremely lightweight (`< 1MB` total).
- **Architecture:** Zero-dependency Single-Page Application (SPA).
- **Security:** Safe DOM manipulation using `textContent` to prevent script injection.
- **Hosting:** Google Cloud Run containerized via `nginx`.

---

## 🧠 Decision Logic Explanation

The engine uses a structured dataset object (`STADIUM_DATA`) to hold facility information. 

**Logic Pipeline:**
1. **Gates:** Sorted ascendingly by an assigned crowd score (`LOW` = 1, `HIGH` = 3), then by `entranceTime`.
2. **Food:** Sorted ascendingly by `waitMinutes`.
3. **Washrooms:** Filtered by `crowdLevel === 'FREE'`. 

Whenever a user queries the Assistant, the engine processes keywords. It then returns the calculated top pick and appends the reasoning to the response (e.g., `"I recommend Gate 2 because it has the lowest crowd level (Low) and fastest entry (2 min)."`).

---

## 🗺️ Google Services Used

- **Live Venue Map (Google Maps):** Embedded iframe to provide context around the Narendra Modi Stadium.
- **Google Fonts:** Clean, modern typography (Inter, Space Grotesk).
- **Google Cloud Run:** Live staging deployment.

---

## 📐 Assumptions (Mock Data)

Since real-time API integrations depend on local stadium infrastructure, this application uses a robust simulated mock dataset:
- Gates start at High/Low/Medium statuses.
- Food wait times range from 2–10 minutes.
- Washrooms are toggled FREE or BUSY.
- A background `DataSimulator` realistically alters wait durations and statuses every 30 seconds to replicate live event flow.
