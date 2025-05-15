# 🌤️ AI-Powered Weather Assistant

A smart full-stack weather assistant that uses **Google Gemini AI (GenAI)** and real-time weather APIs to understand natural language queries and deliver accurate weather reports.

---

## 🚀 Features

- 🌍 Understands city and date from user queries using **Google Gemini AI**
- 🌦️ Fetches real-time & future weather data from [WeatherAPI](https://www.weatherapi.com/)
- 💬 Conversational responses with weather summaries
- ⚙️ Backend built with **Express.js** using **ES Modules**
- 🔒 CORS enabled API routes
- 📁 Frontend served via static `index.html`

---

## 🧠 How It Works

1. User asks a question like:
   > "What's the weather in Mumbai today and in Delhi tomorrow?"
2. The query is sent to the Gemini AI API which returns:
   ```json
   {
     "weather_details_needed": true,
     "location": [
       {"city": "mumbai", "date": "today"},
       {"city": "delhi", "date": "2025-04-30"}
     ]
   }
3. Server fetches weather data for each city/date.

4. AI generates a human-like weather summary using the response.

## 🛠️ Tech Stack
Node.js + Express.js

Google GenAI (Gemini 2.0)

WeatherAPI

HTML/CSS (static frontend)

CORS + ES Module support


## 🔧 Setup Instructions
git clone https://github.com/your-username/ai-weather-assistant.git
cd ai-weather-assistant
npm install


## Demo

https://github.com/user-attachments/assets/8eba2f78-fc49-47a8-a730-4772b37cd5d9




