# ldlc-founders-bot
Selenium bot for auto-purchasing Nvidia Founders graphics cards at LDLC

# Requirements
You need to have Node.js installed in your computer
https://nodejs.org/es/

# Configuración
1. Clone the repo and open it with Visual Studio
2. Execute "npm i" in the terminal to install all the dependencies
3. You might need to install ChromeDriver -> version matching your Google Chrome version
  https://chromedriver.chromium.org/

4. Introduce the required data for variables such as "LDLCmail" or "profile"
6. Execute "cd .\test\" to go to the correct directory
7. Execute "node .\test.js"


This bot is currently tracking 3060 Ti and 3070 GPUS for LDLC Spain. If you want to track another GPU you will need to change the code line that specifies which one you're tracking.
