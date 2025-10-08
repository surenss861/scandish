# 🔧 Menu Branding Troubleshooting Guide

## ✅ Database Status: WORKING
- Menu branding columns exist in database
- All 8 new columns are available
- Database connection is successful

## 🐛 Common Issues & Solutions

### 1. **Menu Page Not Loading**
**Symptoms:** Cannot navigate to `/branding/menu`
**Solutions:**
- Check browser console for JavaScript errors
- Ensure dev server is running (`npm run dev`)
- Clear browser cache and hard refresh (Ctrl+F5)

### 2. **Options Not Responding**
**Symptoms:** Clicking menu layout/style options doesn't change anything
**Solutions:**
- Check if `useBrandingState` hook is working
- Look for console errors in browser dev tools
- Verify the debug info shows the current values

### 3. **Preview Not Updating**
**Symptoms:** Live preview doesn't change when options are selected
**Solutions:**
- Check if `UnifiedBrandingPreview` component is receiving props
- Look for React rendering errors in console
- Verify CSS custom properties are being applied

### 4. **Save Not Working**
**Symptoms:** "Save Menu Style" button doesn't work or shows error
**Solutions:**
- Check network tab for API errors
- Verify backend branding endpoint is running
- Check if user is authenticated

### 5. **Settings Not Persisting**
**Symptoms:** Settings reset when page refreshes
**Solutions:**
- Check if data is being saved to database
- Verify backend API is working
- Check if branding state is loading from database

## 🔍 Debug Steps

### Step 1: Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Navigate to `/branding/menu`
4. Look for any red error messages
5. Report any errors found

### Step 2: Check Debug Info
1. Navigate to `/branding/menu`
2. Look for the debug info panel at bottom
3. Check if all values show correctly:
   - `menuLayout: single-column` (or selected option)
   - `menuStyle: minimal` (or selected option)
   - `itemDisplay: full-details` (or selected option)
   - etc.

### Step 3: Test Individual Features
1. **Menu Layout Options:**
   - Click each layout option (Single Column, Two Column, etc.)
   - Check if debug info updates
   - Check if preview changes

2. **Menu Style Options:**
   - Click each style option (Minimal, Elegant, etc.)
   - Check if debug info updates
   - Check if preview changes

3. **Item Display Options:**
   - Click each display option (Name only, etc.)
   - Check if debug info updates
   - Check if preview changes

4. **Price Display Options:**
   - Click each price option (Inline, Separate, etc.)
   - Check if debug info updates
   - Check if preview changes

5. **Category Style Options:**
   - Click each category option (Headers, Dividers, etc.)
   - Check if debug info updates
   - Check if preview changes

6. **Advanced Toggles:**
   - Toggle each switch (Show Images, Allergens, etc.)
   - Check if debug info updates
   - Check if preview changes

### Step 4: Test Save Functionality
1. Change some settings
2. Click "Save Menu Style" button
3. Check for success/error message
4. Refresh page
5. Check if settings persist

## 📋 Specific Feature Tests

### Menu Layout Test
- **Expected:** Preview should change layout structure
- **Check:** Debug info shows selected layout
- **Issue:** If not working, check CSS custom properties

### Menu Style Test
- **Expected:** Preview should change visual style
- **Check:** Debug info shows selected style
- **Issue:** If not working, check style application logic

### Item Display Test
- **Expected:** Preview should show different item information
- **Check:** Debug info shows selected display option
- **Issue:** If not working, check conditional rendering

### Price Display Test
- **Expected:** Preview should show prices differently
- **Check:** Debug info shows selected price style
- **Issue:** If not working, check price styling logic

### Category Style Test
- **Expected:** Preview should show categories differently
- **Check:** Debug info shows selected category style
- **Issue:** If not working, check category styling logic

### Advanced Toggles Test
- **Expected:** Preview should show/hide elements based on toggles
- **Check:** Debug info shows toggle states
- **Issue:** If not working, check conditional rendering

## 🚨 Error Reporting

When reporting issues, please include:

1. **Browser Console Errors:** Any red error messages
2. **Debug Info Values:** What the debug panel shows
3. **Specific Feature:** Which exact feature isn't working
4. **Expected vs Actual:** What you expected vs what happened
5. **Steps to Reproduce:** Exact steps to trigger the issue

## 🔧 Quick Fixes

### Reset Everything
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Check Network
1. Open Network tab in dev tools
2. Try saving settings
3. Look for failed requests (red entries)

### Check Authentication
1. Verify you're logged in
2. Check if user data is available
3. Try logging out and back in

## 📞 Need Help?

If issues persist after trying these steps:
1. Copy the exact error message from console
2. Screenshot the debug info panel
3. List which specific features aren't working
4. Include browser and version information

