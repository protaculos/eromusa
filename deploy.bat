@echo off
cd /d "C:\Users\prota\OneDrive\Desktop\Ero Musa"
taskkill /F /IM git.exe 2>nul
git add -A
git commit -m "feat: instant credit UI updates via local sessionStorage + addCredits/deductCredits"
git push
echo Done!
pause
