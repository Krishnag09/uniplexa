# How to Review Screens While Building

## Quick Start - iOS Simulator (Recommended)

1. **Start the development server:**
   ```bash
   cd app
   npm start
   ```

2. **Open iOS Simulator:**
   - Press `i` in the terminal, OR
   - Run: `npm run ios`
   - This will open the iOS Simulator automatically

3. **Hot Reload:**
   - Changes auto-reload when you save files
   - Shake device/simulator (Cmd+Ctrl+Z) to open dev menu
   - Press `r` in terminal to reload manually

## Alternative: Physical Device with Expo Go

1. **Install Expo Go** from App Store on your iPhone

2. **Start dev server:**
   ```bash
   cd app
   npm start
   ```

3. **Scan QR code** with your iPhone camera or Expo Go app

## Dev Navigation Helper

I've added a dev menu (only visible in development mode) that lets you:
- **Navigate between screens** easily without real data
- **Toggle visibility** by tapping the gear icon (⚙️) in top-right corner
- **Switch screens** using the dev menu buttons

### Adding New Screens for Testing

1. Create a new file in `app/app/` (e.g., `dashboard.jsx`)
2. Add it to `app/app/_layout.jsx`:
   ```jsx
   <Stack.Screen name="dashboard" options={{ headerShown: false }} />
   ```
3. Add a button in the dev menu to navigate to it

## File-Based Routing (Expo Router)

- `app/index.jsx` → Home/Start screen (`/`)
- `app/login.jsx` → Login screen (`/login`)
- `app/dashboard.jsx` → Dashboard screen (`/dashboard`)
- etc.

## Tips

- **Fast Refresh**: Enabled by default - saves automatically reload
- **Debugging**: Use `console.log()` - logs appear in terminal
- **Styling**: Use React Native StyleSheet or inline styles
- **Images**: Place in `app/assets/images/` and use `require()`

## Troubleshooting

- **Simulator not opening?** Make sure Xcode is installed
- **Changes not showing?** Press `r` in terminal to reload
- **Font issues?** Check font is loaded in `useFonts()` hook

