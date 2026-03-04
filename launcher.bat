@echo off
setlocal

cd /d "%~dp0"
title Cantares - Launcher

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js no esta instalado o no esta en PATH.
  echo Descargalo en https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\\express\\package.json" (
  echo Instalando dependencias...
  npm install
  if errorlevel 1 (
    echo Error instalando dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando Cantares...
echo Abre http://localhost:3000 en tu navegador.
echo (No cierres esta ventana mientras el servidor este activo.)
call npm start
echo.
echo El servidor se detuvo.
pause
