# QueueLess AI

## Problem Statement
Large stadiums and physical events often suffer from severe bottlenecks at entry points, food stalls, and washrooms. Attendees struggle to find the most efficient routes, leading to long wait times, frustration, and a diminished event experience.

## Solution Overview
QueueLess AI is a lightweight, single-page web application designed to serve as a smart assistant for stadium attendees. It acts as a real-time decision engine that guides users to the least crowded gates, fastest food stalls, and freest washrooms, minimizing wait times and improving crowd flow.

## Features
- **Smart AI Chat Assistant**: Users can converse naturally using keywords to find optimal pathways.
- **Intelligent Decision Engine**: Calculates the "best" recommended option based on shortest wait times and lowest crowd density, providing clear reasoning.
- **Live Crowd Dashboard**: A visual representation of crowd levels and wait times across different zones.
- **Secure Admin Portal**: An authenticated control center (`admin.html`) with simulated Google Firebase Auth flow to demonstrate role-based access security. 
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

## Security & Edge Case Handling
- **Text Injection Prevention**: Strict usage of `textContent` instead of `innerHTML` to prevent Cross-site Scripting (XSS).
- **Sanitization & Boundaries**: Using `.trim()`, `.toLowerCase()`, and Regex sanitization to handle invalid inputs safely.
- **Edge Cases**: Try/Catch bounds heavily enclose the business engine to silently log boundary exceptions and provide safe fallback messages.
- **Testing Coverage**: Includes a robust test suite (`tests/app.test.js`) and GitHub Action automation (`.github/workflows/test.yml`) securing core workflows and integration boundaries against unexpected failures.

## Google Services & Integrations
- **Google Cloud Platform (GCP - Cloud Run)**: Designed natively for GCP Cloud Run using an optimized NGINX Dockerfile to dynamically serve static assets across a load-balanced node.
- **Google Firebase**: Integrated with the Google Firebase SDK for core event telemetry tracking (`firebase.analytics`) mapping real user engagement to the GCP dashboard.
- **Google Maps Embed API**: An embedded interactive venue map (Narendra Modi Stadium) to provide immediate visual context to users.

## Assumptions
- Real-time crowd data serves via a simulated structured API to the client component.
- The platform operates well under massive concurrent loads via Google Cloud Run scaling configurations.
- Extreme frontend optimization removes the need for large bloated JS frameworks, using vanilla ES6 + Modern CSS ensuring stable load times.
