@echo off
REM Script to check and fix Node.js PATH issues on Windows

echo Checking Node versions...
echo.

where node
echo.

echo Searching for all Node installations...
dir "C:\Program Files\nodejs" 2>nul
if errorlevel 1 echo No Node.js found in C:\Program Files\nodejs
echo.

echo Searching in AppData...
dir "%APPDATA%\npm" 2>nul
if errorlevel 1 echo No npm found in AppData

echo.
echo ===== INSTRUCTIONS =====
echo 1. If you see Node.js v24 above, you must UNINSTALL it completely:
echo    - Open Windows Settings
echo    - Go to Apps ^> Installed Apps
echo    - Search for "Node.js"
echo    - Click the three dots and select "Uninstall"
echo    - Restart your computer
echo.
echo 2. Then download and install Node 20 LTS from:
echo    https://nodejs.org/dist/v20.17.0/node-v20.17.0-x64.msi
echo.
echo 3. During installation, make sure "Add to PATH" is checked
echo.
echo 4. Restart Cursor and try again
echo.
pause

