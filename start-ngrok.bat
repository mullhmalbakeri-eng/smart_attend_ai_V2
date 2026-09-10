@echo off
echo =========================================
echo  Smart Attend AI - Mobile Tunnel
echo =========================================
echo.
echo  1. افتح المتصفح: https://dashboard.ngrok.com/signup
 echo  2. سجل بحساب Google
 echo  3. اذهب إلى 'Your Authtoken'
 echo  4. انسخ التوكن
 echo.
set /p token=أدخل الـ Autotoken من ngrok: 
ngrok.exe config add-authtoken %token%
ngrok.exe http 3000
pause
