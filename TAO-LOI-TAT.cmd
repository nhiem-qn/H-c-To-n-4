@echo off
cd /d "%~dp0"
set "MIA_INSTALL_DIR=%CD%"
powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\Hoc Toan cung MIA.lnk'); $s.TargetPath=Join-Path $env:MIA_INSTALL_DIR 'CHAY-MIA.cmd'; $s.WorkingDirectory=$env:MIA_INSTALL_DIR; $s.Description='Hoc Toan cung co Mi A'; $s.Save()"
if errorlevel 1 (echo Chua tao duoc loi tat. Mo CHAY-MIA.cmd truc tiep.) else (echo Da tao loi tat Hoc Toan cung MIA tren Desktop.)
pause
