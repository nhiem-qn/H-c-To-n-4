@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Hoc Toan cung MIA - May chu local
if exist "runtime\python.exe" (
  "runtime\python.exe" "CHAY-TREN-MAY.py"
  goto done
)
where py >nul 2>nul
if not errorlevel 1 (
  py -3 "CHAY-TREN-MAY.py"
  goto done
)
where python >nul 2>nul
if not errorlevel 1 (
  python "CHAY-TREN-MAY.py"
  goto done
)
echo Hay tai goi MIA-Windows-Portable.zip trong GitHub Releases.
echo Goi do da co san bo chay, khong can cai Python.
start "" "https://github.com/nhiem-qn/H-c-To-n-4/releases/latest"
:done
pause
