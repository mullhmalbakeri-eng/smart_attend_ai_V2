# 📱 Testing Camera on Mobile with Ngrok

## 🚀 Step 1: Install Ngrok
```bash
# Install ngrok globally
npm install -g ngrok

# Or using yarn
yarn global add ngrok
```

## 🌐 Step 2: Start Your Next.js App
```bash
# Make sure your app is running on port 3000
npm run dev
# or
yarn dev
```

## 🔗 Step 3: Create HTTPS Tunnel with Ngrok
```bash
# Create tunnel for port 3000
ngrok http 3000

# Or for specific port
ngrok http 3000
```

## 📱 Step 4: Use HTTPS URL on Mobile

After running ngrok, you'll get output like:
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.1.0
Region                        United States (us-cal-1)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

**Use the HTTPS URL on your mobile device:**
- 🌐 `https://abc123.ngrok.io` (use your actual ngrok URL)
- 📱 Open this URL on your mobile browser
- 📸 Test the QR scanner functionality

## 📸 Step 5: Test Camera Features

### Android Testing:
1. Open Chrome/Chrome Mobile
2. Go to your ngrok URL
3. Allow camera permissions when prompted
4. Test QR scanning functionality

### iOS Testing:
1. Open Safari
2. Go to your ngrok URL  
3. Allow camera permissions when prompted
4. Test QR scanning functionality

## 🔧 Additional Ngrok Options

```bash
# For specific subdomain (paid feature)
ngrok http 3000 --subdomain=smart-attend

# For custom region
ngrok http 3000 --region=eu

# For debugging with logs
ngrok http 3000 --log stdout
```

## 📱 Mobile Testing Checklist

- ✅ **HTTPS Required**: Mobile browsers require HTTPS for camera access
- ✅ **Camera Permission**: Allow camera when prompted
- ✅ **Responsive Design**: Test on different screen sizes
- ✅ **QR Scanning**: Test with actual QR codes
- ✅ **Network Speed**: Test on different network conditions

## 🐛 Common Issues & Solutions

### Camera Not Working:
- **Issue**: HTTPS required
- **Solution**: Use ngrok or deploy to HTTPS server

### Permission Denied:
- **Issue**: Camera permission blocked
- **Solution**: Check browser settings, allow camera access

### Scanner Not Loading:
- **Issue**: html5-qrcode library not loading
- **Solution**: Check network connection, refresh page

## 📸 Testing URLs

Use these URLs on mobile (replace with your ngrok URL):
- 🏠 Login: `https://your-ngrok-url.ngrok.io/login`
- 📱 Scanner: `https://your-ngrok-url.ngrok.io/dashboard/scan`
- 📊 Dashboard: `https://your-ngrok-url.ngrok.io/dashboard`

## 🎯 Pro Tips

1. **Use HTTPS**: Ngrok provides secure HTTPS tunnel
2. **Test Real Device**: Test on actual mobile, not emulator
3. **Check Console**: Monitor browser console for errors
4. **Network Stability**: Ensure stable internet connection
5. **Clear Cache**: Clear browser cache if issues persist
