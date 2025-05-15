const chatMessages = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const sendText = document.getElementById('sendText');
        const sendLoader = document.getElementById('sendLoader');
        
        // Mock API for demonstration purposes - in production, this would connect to your Node.js backend
        async function mockProcessQuery(query) {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simple weather response simulation
            const cities = ['New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Mumbai', 'Delhi', 'Beijing'];
            const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Clear', 'Overcast', 'Thunderstorm'];
            const today = new Date();
            
            const lowerQuery = query.toLowerCase();
            let detectedCity = null;
            
            // Simple city detection
            for (const city of cities) {
                if (lowerQuery.includes(city.toLowerCase())) {
                    detectedCity = city;
                    break;
                }
            }
            
            if (!detectedCity) {
                if (lowerQuery.includes('weather')) {
                    return {
                        weatherDetailsNeeded: false,
                        weatherReport: "I need to know which city you're asking about. Could you please specify a city name?"
                    };
                }
                return {
                    weatherDetailsNeeded: false,
                    weatherReport: "I'm not sure if you're asking about weather. You can ask me about the weather in specific cities like 'What's the weather in New York today?'"
                };
            }
            
            // Randomly generate weather data for demonstration
            const temp = Math.floor(Math.random() * 30) + 5;
            const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
            const humidity = Math.floor(Math.random() * 50) + 30;
            const windSpeed = Math.floor(Math.random() * 20) + 5;
            
            // Create weather report
            let weatherReport = `The weather in ${detectedCity} is ${condition} with a temperature of ${temp}°C. `;
            weatherReport += `The humidity is ${humidity}% and wind speed is ${windSpeed} km/h.`;
            
            return {
                weatherDetailsNeeded: false,
                weatherReport,
                weatherData: {
                    city: detectedCity,
                    temperature: temp,
                    condition,
                    humidity,
                    windSpeed,
                    date: today.toLocaleDateString()
                }
            };
        }
        
        // In production, replace this with your actual API call to your Node.js backend
        async function processUserQuery(query) {
            try {
                // This would be replaced with a fetch call to your Node.js backend
                // return await fetch('/api/chat', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ query })
                // }).then(res => res.json());
                
                // For now, using the mock API
                return await mockProcessQuery(query);
            } catch (error) {
                console.error('Error processing query:', error);
                return {
                    weatherDetailsNeeded: false,
                    weatherReport: "Sorry, I encountered an error processing your request. Please try again later."
                };
            }
        }
        
        function addUserMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message user-message';
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function addAIMessage(message, weatherData = null) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message ai-message';
            messageElement.textContent = message;
            
            // Add weather card if we have weather data
            if (weatherData) {
                const weatherCard = document.createElement('div');
                weatherCard.className = 'weather-card';
                
                const weatherIconMap = {
                    'Sunny': '☀️',
                    'Cloudy': '☁️',
                    'Rainy': '🌧️',
                    'Partly Cloudy': '⛅',
                    'Clear': '🌤️',
                    'Overcast': '☁️',
                    'Thunderstorm': '⛈️'
                };
                
                const icon = weatherIconMap[weatherData.condition] || '🌡️';
                
                weatherCard.innerHTML = `
                    <div class="weather-info">
                        <div class="weather-icon">${icon}</div>
                        <div>
                            <h3>${weatherData.city}</h3>
                            <div class="temp-container">
                                <span class="temperature">${weatherData.temperature}°C</span>
                                <span style="margin-left: 10px">${weatherData.condition}</span>
                            </div>
                            <div>${weatherData.date}</div>
                        </div>
                    </div>
                    <div class="details">
                        <div class="detail-item">
                            <div>Humidity</div>
                            <div>${weatherData.humidity}%</div>
                        </div>
                        <div class="detail-item">
                            <div>Wind</div>
                            <div>${weatherData.windSpeed} km/h</div>
                        </div>
                    </div>
                `;
                
                messageElement.appendChild(weatherCard);
            }
            
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function showTypingIndicator() {
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.id = 'typingIndicator';
            typingIndicator.innerHTML = '<span></span><span></span><span></span>';
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function removeTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }
        
        function setLoading(isLoading) {
            if (isLoading) {
                sendText.style.display = 'none';
                sendLoader.style.display = 'inline-block';
                sendButton.disabled = true;
                messageInput.disabled = true;
            } else {
                sendText.style.display = 'inline-block';
                sendLoader.style.display = 'none';
                sendButton.disabled = false;
                messageInput.disabled = false;
            }
        }
        
        async function handleUserMessage() {
            const message = messageInput.value.trim();
            if (!message) return;
            
            // Clear input
            messageInput.value = '';
            
            // Add user message to chat
            addUserMessage(message);
            
            // Show loading indicators
            setLoading(true);
            showTypingIndicator();
            
            // Process the message with our AI
            try {
                const response = await processUserQuery(message);
                
                // Remove typing indicator
                removeTypingIndicator();
                
                // Add AI message with potential weather data
                addAIMessage(
                    response.weatherReport,
                    response.weatherData || null
                );
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator();
                addAIMessage('Sorry, I encountered an error. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        
        function useQuery(query) {
            messageInput.value = query;
            handleUserMessage();
        }
        
        // Event listeners
        sendButton.addEventListener('click', handleUserMessage);
        
        messageInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleUserMessage();
            }
        });
        
        // Focus input on page load
        messageInput.focus();