@echo off
REM Batch wrapper for rebuild.ps1
SET SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%rebuild.ps1" %*