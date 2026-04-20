# QueueLess AI

## Problem Statement
Large stadiums and physical events often suffer from severe bottlenecks at entry points, food stalls, and washrooms. Attendees struggle to find the most efficient routes, leading to long wait times, frustration, and a diminished event experience.

## Solution Overview
QueueLess AI is a lightweight, single-page web application designed to serve as a smart assistant for stadium attendees. It acts as a real-time decision engine that guides users to the least crowded gates, fastest food stalls, and freest washrooms, minimizing wait times and improving crowd flow.

## Features
- **Smart AI Chat Assistant**: Users can converse naturally using keywords to find optimal pathways.
- **Intelligent Decision Engine**: Calculates the "best" recommended option based on shortest wait times and lowest crowd density, providing clear reasoning.
- **Live Crowd Dashboard**: A visual representation of crowd levels and wait times across different zones.
- **Google Maps Integration**: Displays a live map of the venue to aid navigation.

## Tech Stack
- **HTML5**: Semantic web structure.
- **CSS3**: Independent, modular CSS with flexbox and grid layouts. No external frameworks. It features a modern dark aesthetic, using vibrant blur and glassmorphism.
- **JavaScript (ES6+)**: Vanilla JS for logic, DOM manipulation, and data handling. No external libraries.

## Decision Logic Explanation
The intelligent decision-making is powered by evaluating JSON/Object data arrays summarizing current stadium states.
- `getBestGate()` uses `Array.reduce()` to find the gate with the lowest score (a computed metric of total crowd + wait time).
- `getBestFood()` uses `Array.reduce()` to find the food stall with the minimum wait minutes.
- `getBestWashroom()` evaluates queue lengths returning the option with the shortest list of waiting people.

All AI responses clearly combine the recommendation with the reasoning variables (e.g. queue length, wait times) to ensure transparency. The responses are dynamic and clearly state exactly *why* the option was chosen.

## Security Practices
- **Text Injection Prevention**: Strict usage of `textContent` instead of `innerHTML` to prevent Cross-site Scripting (XSS).
- **Sanitization**: Using `.trim()` and `.toLowerCase()` to clean raw input natively prior to processing.
- **No External Scripts**: Aside from standard google fonts, zero external javascript libraries are fetched, reducing attack surface vectors.

## Google Services Used
- **Google Maps Embed API**: An embedded interactive venue map (Narendra Modi Stadium used as a demo example) to provide visual context immediately to users within the app.

## Assumptions
- Real-time crowd data (such as gate crowd level and wait time) is aggregated frequently by a backend server and fed via API to this client component. The current version safely simulates this payload. 
- General keyword matching provides enough coverage for quick questions while attending a chaotic event.
- Total application scope requires extreme optimization, thus keeping assets well under 1 MB and using zero external framework dependencies while still looking premium and functioning optimally.
