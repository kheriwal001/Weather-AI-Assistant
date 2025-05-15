// Updated server.js to use ES modules

import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// ES Module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Google Gemini AI
const ai = new GoogleGenAI({ apiKey: "AIzaSyCzCkxXtk_3xa6evEmJtmGjPhJN8gwNOs4" });

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const result = await processUserQuery(query);
        res.json(result);
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'Failed to process query' });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});

// Process user query
async function processUserQuery(query) {
    // Create a conversation history array for the Gemini API
    const conversationHistory = [];
    
    // Add the user's query with the system prompt
    const systemPrompt = `
    You are an AI agent, who will respond to me in JSON format only.
    Analyse the user query and try to fetch city and date details from it.
    Date format should be in (yyyy-month-date) if user ask for future weather.
    If user ask for today weather, mark date as 'today'.
    To fetch weather details, I already have some function which can fetch the weather details for me,

    if you need weather information, use the below format
    JSON format should look like below:
    {
      "weather_details_needed": true,
      "location": [{"city":"mumbai", "date":"today"},{"city":"delhi", "date":"2025-04-30"}]
    }

    User asked this question: ${query}

    Strictly follow JSON format, respond only in JSON format.
    `;

    conversationHistory.push({
        role: "user",
        parts: [{ text: systemPrompt }]
    });

    // Get response from Gemini
    const model = ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: conversationHistory
    });
    
    const result = await model;
    
    // Parse the response
    let response = result.text().trim();
    response = response.replace(/^```json\s*|```$/g, '').trim();
    
    const data = JSON.parse(response);

    // If weather details are needed, fetch them
    if (data.weather_details_needed === true) {
        const weatherInformation = await getWeather(data.location);
        
        // Add the weather information to the conversation
        conversationHistory.push({
            role: 'model',
            parts: [{ text: response }]
        });
        
        // Send the weather information back to Gemini
        const weatherPrompt = `This is the weather report I Have fetched for you, use this weather report to generate user response, earlier you asked me to fetch weather details for model. ${JSON.stringify(weatherInformation)}`;
        
        conversationHistory.push({
            role: 'user',
            parts: [{ text: weatherPrompt }]
        });
        
        // Get the final response from Gemini
        const finalResult = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: conversationHistory
        });
        
        let finalResponse = finalResult.text().trim();
        finalResponse = finalResponse.replace(/^```json\s*|```$/g, '').trim();
        
        const finalData = JSON.parse(finalResponse);
        
        // Add weather data for the frontend
        return {
            weatherDetailsNeeded: false,
            weatherReport: finalData.weather_report,
            weatherData: extractWeatherData(weatherInformation, data.location)
        };
    }
    
    // Return the response directly if no weather details are needed
    return {
        weatherDetailsNeeded: false,
        weatherReport: data.weather_report || "I'm not sure what you're asking about. Could you please ask about the weather in a specific city?"
    };
}

// Function to fetch weather information
async function getWeather(location) {
    const weatherInfo = [];

    for (const { city, date } of location) {
        try {
            if (date.toLowerCase() === 'today') {
                const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=1c930efb35ea46caa93123748252504&q=${city}`);
                const data = await response.json();
                weatherInfo.push(data);
            } else {
                const response = await fetch(`http://api.weatherapi.com/v1/future.json?key=1c930efb35ea46caa93123748252504&q=${city}&dt=${date}`);
                const data = await response.json();
                weatherInfo.push(data);
            }
        } catch (error) {
            console.error(`Error fetching weather for ${city} on ${date}:`, error);
            weatherInfo.push({ error: `Failed to fetch weather for ${city}` });
        }
    }

    return weatherInfo;
}

// Extract relevant weather data for the frontend
function extractWeatherData(weatherInfo, locations) {
    if (!weatherInfo || weatherInfo.length === 0) return null;
    
    // Get the first location as the primary one
    const primaryLocation = locations[0];
    const primaryData = weatherInfo[0];
    
    if (primaryData.error) return null;
    
    try {
        // Check if we have current weather or forecast data
        if (primaryData.current) {
            // Current weather
            return {
                city: primaryData.location.name,
                temperature: primaryData.current.temp_c,
                condition: primaryData.current.condition.text,
                humidity: primaryData.current.humidity,
                windSpeed: primaryData.current.wind_kph,
                date: new Date().toLocaleDateString()
            };
        } else if (primaryData.forecast && primaryData.forecast.forecastday) {
            // Forecast data
            const forecastDay = primaryData.forecast.forecastday[0];
            return {
                city: primaryData.location.name,
                temperature: forecastDay.day.avgtemp_c,
                condition: forecastDay.day.condition.text,
                humidity: forecastDay.day.avghumidity,
                windSpeed: forecastDay.day.maxwind_kph,
                date: new Date(forecastDay.date).toLocaleDateString()
            };
        }
    } catch (error) {
        console.error('Error extracting weather data:', error);
    }
    
    return null;
}