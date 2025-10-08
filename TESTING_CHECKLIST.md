# 🧪 Testing Checklist - Menu Branding Features

## ✅ Database Setup
- [ ] Run `ADD_MENU_BRANDING_COLUMNS.sql` in Supabase SQL editor
- [ ] Verify new columns are added to `branding_settings` table:
  - `menu_style`
  - `item_display` 
  - `price_style`
  - `category_style`
  - `show_item_images`
  - `show_allergens`
  - `show_calories`
  - `compact_mode`

## ✅ Frontend Components
- [ ] MenuPage.jsx compiles without errors
- [ ] UnifiedBrandingPreview.jsx includes menu preview
- [ ] App.jsx routes work correctly
- [ ] BrandingLayout.jsx includes Menu tab

## ✅ Navigation & Routing
- [ ] Navigate to `/branding/menu`
- [ ] Menu tab appears in branding navigation
- [ ] Menu tab is clickable and loads correctly
- [ ] No naming conflicts with existing MenuPage

## ✅ Menu Customization Features
- [ ] Menu Layout options work (Single Column, Two Column, Grid, Card-based)
- [ ] Menu Style options work (Minimal, Elegant, Modern, Classic, Luxury)
- [ ] Item Display options work (Name only, Name+Description, etc.)
- [ ] Price Display options work (Inline, Separate, Highlighted, Minimal)
- [ ] Category Style options work (Headers, Dividers, Cards, Tabs)
- [ ] Advanced toggles work (Show Images, Allergens, Calories, Compact Mode)

## ✅ Live Preview
- [ ] Menu preview updates in real-time
- [ ] Sample menu items display correctly
- [ ] Category styling reflects selected options
- [ ] Price styling reflects selected options
- [ ] Allergen badges appear when enabled
- [ ] Calorie information appears when enabled

## ✅ Data Persistence
- [ ] Settings save to database when "Save Menu Style" clicked
- [ ] Settings load correctly when page refreshes
- [ ] Default values are applied for new users
- [ ] Settings persist across browser sessions

## ✅ Integration with Existing Features
- [ ] Menu settings work with existing branding (colors, fonts, etc.)
- [ ] Export/Import branding includes menu settings
- [ ] Reset to defaults works for menu settings
- [ ] Toast notifications appear for save/reset actions

## 🚨 Common Issues to Check
- [ ] No console errors when navigating to menu page
- [ ] No console errors when changing menu options
- [ ] No console errors when saving settings
- [ ] Preview updates smoothly without flickering
- [ ] All buttons and toggles are responsive
- [ ] Mobile responsiveness works correctly

## 🎯 Success Criteria
- [ ] All menu customization options work as expected
- [ ] Live preview accurately reflects changes
- [ ] Settings persist across sessions
- [ ] No JavaScript errors in console
- [ ] UI is responsive and user-friendly
- [ ] Integration with existing branding system works seamlessly

