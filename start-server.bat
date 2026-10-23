@echo off
title AI Vocab Master - Local Server
echo Dang khoi dong Web Server tai http://localhost:8080 ...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
