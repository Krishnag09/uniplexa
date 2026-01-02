# Efficient Figma → React Native Workflow

## 🎯 Best Practice Workflow

### Step 1: Organize Your Figma Design
- **Group related elements** in Figma (buttons, forms, cards)
- **Name layers clearly** (e.g., "Login Button", "Email Input")
- **Use consistent spacing** (8px grid recommended)

### Step 2: Extract Information from Figma

#### For Each Screen/Component, Get:

1. **Container/View Properties:**
   ```
   - Frame dimensions (width, height)
   - Position (x, y)
   - Background color
   - Border radius
   - Constraints/Alignment
   ```

2. **Text Elements:**
   ```
   - Text content
   - Font family
   - Font size
   - Font weight
   - Color (hex or rgba)
   - Line height
   - Text alignment
   ```

3. **Buttons/Interactive Elements:**
   ```
   - Dimensions
   - Background color
   - Border (width, color, radius)
   - Text styling
   - Padding
   ```

4. **Images/Icons:**
   ```
   - Dimensions
   - Source file name
   - Position
   ```

### Step 3: Share with AI Assistant

#### ✅ **EFFICIENT Method (Recommended):**

**Option A: Copy Figma Code (Fastest)**
1. In Figma, select element
2. Right-click → "Copy as Code" → "Swift" or "React"
3. Paste the code directly to AI
4. AI converts Swift/React code → React Native

**Option B: Batch Export (For Multiple Elements)**
1. Select all elements in a container
2. Copy code for the parent container
3. Then copy code for each child element
4. Share in one message: "Here's the login form container and all its children"

**Option C: Screenshot + Description (When Code Unavailable)**
1. Take screenshot of the design
2. Describe: "Top section has logo, middle has form with email/password inputs, bottom has login button"
3. AI builds from description

#### ❌ **INEFFICIENT Methods (Avoid):**
- Sharing one element at a time
- Not grouping related elements
- Skipping constraints/alignment info
- Not providing dimensions

### Step 4: Iterative Building Process

#### **Build in Layers:**

1. **Foundation First:**
   ```
   - Background colors
   - Main containers
   - Layout structure
   ```

2. **Then Add Content:**
   ```
   - Text elements
   - Images
   - Icons
   ```

3. **Finally, Interactions:**
   ```
   - Buttons
   - Input fields
   - Navigation
   ```

### Step 5: Batch Requests (Most Efficient)

Instead of:
```
❌ "Add this button"
❌ "Now add this text"
❌ "Now add this image"
```

Do this:
```
✅ "Here's the login form container code and all 5 elements inside it"
✅ "Add these 3 buttons to the dashboard"
✅ "Here's the complete header section with logo, title, and menu icon"
```

## 📋 Template for Sharing Figma Elements

```
Screen: [Screen Name]
Container: [Dimensions, position, background]
Elements:
1. [Element name] - [Type] - [Code/Description]
2. [Element name] - [Type] - [Code/Description]
3. ...
```

## 🔄 Component Consolidation (Automatic)

When you share Figma code in batches, I will:

1. **Identify Reusable Patterns:**
   - Same button style used multiple times → Create `<Button>` component
   - Same input field style → Create `<Input>` component
   - Same container dimensions → Create reusable container

2. **Extract to Constants:**
   - Colors → `constants/Theme.js`
   - Fonts → `constants/Theme.js`
   - Spacing → `constants/Theme.js`

3. **Create Reusable Components:**
   - `components/ui/Button.jsx` - All buttons use this
   - `components/ui/Input.jsx` - All inputs use this
   - `components/ui/Container.jsx` - Standardized containers

4. **Update Existing Screens:**
   - Replace duplicate code with components
   - Ensure consistency across all screens

**Example:**
If you share 3 buttons with the same style, I'll:
- Create one `<Button>` component
- Use it 3 times with different props
- All buttons stay consistent automatically

## 🚀 Pro Tips

1. **Use Figma Dev Mode** (if available):
   - Shows exact measurements
   - CSS/React code generation
   - Better for extracting styles

2. **Export Assets First:**
   - Export all images/icons to `app/assets/images/`
   - Name them clearly (e.g., `login-button.png`)
   - Share list: "I've added these images: login-button.png, logo.png..."

3. **Group by Functionality:**
   - Share all login-related elements together
   - Share all navigation elements together
   - Share all form elements together

4. **Provide Context:**
   - "This is the login screen"
   - "This button navigates to dashboard"
   - "This form submits to /api/login"

5. **Use Variables/Constants:**
   - Share color palette once: "Primary: #FFB066, Background: rgba(28,32,31,1)"
   - Share font sizes: "Heading: 60px, Body: 16px"
   - AI will reuse these

## 📝 Example Efficient Request

```
I'm building the login screen. Here's the code for:

1. Main container (335x279, centered):
   [Figma code]

2. Email input field:
   [Figma code]

3. Password input field:
   [Figma code]

4. Login button:
   [Figma code]

5. "Forgot password?" text:
   [Figma code]

All elements are inside the container. The button should navigate to /dashboard on press.
```

## ⚡ Quick Reference

**What to Copy from Figma:**
- ✅ Frame/View properties (Swift code)
- ✅ Text properties (UILabel code)
- ✅ Button properties (UIButton code)
- ✅ Color values (hex/rgba)
- ✅ Font information
- ✅ Spacing/padding values

**What AI Needs:**
- ✅ Exact dimensions
- ✅ Colors (hex or rgba)
- ✅ Font names and sizes
- ✅ Positioning/constraints
- ✅ Relationships (parent/child)
- ✅ Any interactions (onPress, navigation)

**What to Avoid:**
- ❌ Vague descriptions ("make it look nice")
- ❌ Missing dimensions
- ❌ One element at a time
- ❌ Not providing context

## 🎨 Current Project Setup

Your project structure:
- `app/app/index.jsx` - Home/Start screen
- `app/app/login.jsx` - Login screen
- `app/assets/images/` - Images folder
- `app/assets/fonts/` - Fonts folder

**Current colors:**
- Background: `rgba(28, 32, 31, 1)`
- Primary/Accent: `rgba(255, 176, 102, 1)` (#FFB066)

**Current fonts:**
- SpaceGrotesk (needs to be added)
- RedHatText (already installed)

