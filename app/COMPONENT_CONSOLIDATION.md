# Component Consolidation Strategy

## ✅ What I Do Automatically

When you share Figma code in batches, I:

### 1. **Identify Patterns**
- Multiple buttons with same style → Extract to `<Button>` component
- Multiple inputs with same style → Extract to `<Input>` component
- Repeated containers → Extract to `<Container>` component

### 2. **Create Reusable Components**
Located in: `app/components/ui/`

**Available Components:**
- `<Button>` - All buttons (primary, secondary, outline variants)
- `<Input>` - All text inputs (with labels, errors, focus states)
- `<Container>` - Standardized containers

### 3. **Extract Constants**
Located in: `app/constants/Theme.js`

**Consolidated:**
- Colors (primary, background, text, etc.)
- Typography (fonts, sizes, line heights)
- Spacing (consistent padding/margins)
- Border radius values
- Container sizes

### 4. **Update All Screens**
- Replace duplicate code with components
- Ensure visual consistency
- Make future changes easier (change once, update everywhere)

## 📋 Example: How It Works

### Before (Duplicated Code):
```jsx
// Screen 1
<TouchableOpacity style={styles.button1}>
  <Text style={styles.buttonText1}>Login</Text>
</TouchableOpacity>

// Screen 2
<TouchableOpacity style={styles.button2}>
  <Text style={styles.buttonText2}>Submit</Text>
</TouchableOpacity>
```

### After (Consolidated):
```jsx
// Both screens use the same component
<Button title="Login" onPress={handleLogin} />
<Button title="Submit" onPress={handleSubmit} />
```

## 🎯 Current Component Library

### Button Component
```jsx
<Button 
  title="Click Me"
  variant="primary" // or "secondary", "outline", "text"
  size="medium" // or "small", "large"
  onPress={handlePress}
  fullWidth={true}
/>
```

### Input Component
```jsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>
```

### Container Component
```jsx
<LoginContainer>
  {/* Your login form content */}
</LoginContainer>
```

## 🔄 My Process When You Share Figma Code

1. **Analyze the batch:**
   - "I see 3 buttons, 2 inputs, 1 container"

2. **Check for existing components:**
   - "Buttons match existing `<Button>` component"
   - "Inputs match existing `<Input>` component"

3. **Create/Update components:**
   - If style is new → Create new variant
   - If style matches → Use existing component

4. **Build the screen:**
   - Use consolidated components
   - Import from `@/components/ui/`
   - Import constants from `@/constants/Theme`

5. **Ensure consistency:**
   - All similar elements use same component
   - Colors from Theme.js
   - Spacing from Theme.js

## 📝 What You Should Know

### ✅ I Will:
- Automatically consolidate duplicate styles
- Create reusable components
- Use consistent colors/spacing
- Update existing screens to use new components

### 📤 You Should:
- Share related elements together (batch approach)
- Let me know if you want a custom variant
- Trust that I'll keep things consistent

### 🎨 Design System
All design tokens are in `app/constants/Theme.js`:
- Colors
- Typography
- Spacing
- Border Radius
- Container Sizes

Change once, update everywhere!

## 💡 Benefits

1. **Consistency:** All buttons/inputs look the same
2. **Maintainability:** Change style once, updates everywhere
3. **Speed:** Faster development with reusable components
4. **Quality:** Less code duplication, fewer bugs

