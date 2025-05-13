@echo off
echo Starting Rasa Server and Action Server...
echo.

:: First initialize conda
start cmd /k "C:\Users\hari\anaconda3\Scripts\conda.exe init cmd.exe && C:\Users\hari\anaconda3\Scripts\conda.exe activate rasanew && cd /d C:\Users\hari\RASA BOTSS\draft2 && rasa run --enable-api --cors "*" --port 5005"

:: Wait a moment before starting the action server
timeout /t 3

:: Start Rasa Action Server
start cmd /k "C:\Users\hari\anaconda3\Scripts\conda.exe init cmd.exe && C:\Users\hari\anaconda3\Scripts\conda.exe activate rasanew && cd /d C:\Users\hari\RASA BOTSS\draft2 && rasa run actions"

echo.
echo Both servers should be starting now. Check the command windows for any errors.