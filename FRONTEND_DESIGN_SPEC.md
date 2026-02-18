# DriveSwipe Frontend Design Specification

## Overview
DriveSwipe is a modern, card-based driving safety quiz app with Tinder-like swipe mechanics, game mode with time pressure, and extensive customization via settings.

## Color Palette
- **Primary Green**: `#51cf66` (Correct answers, safe swipes, active states)
- **Danger Red**: `#ff6b6b` (Incorrect answers, unsafe swipes)
- **Warning Yellow**: `#ffd700` ("Not Sure" action)
- **Text Dark**: `#1a1a1a` (Primary text)
- **Text Light**: `#999` (Secondary text, placeholders)
- **Background**: `#f8f9fa` (Light gray background)
- **Card White**: `#fff` (Card backgrounds)
- **Border Gray**: `#e0e0e0` (Dividers, subtle borders)

## Layout Structure

### Top Navigation Bar
**Height**: 56px with 50px padding top
**Components**:
- **Left**: Settings icon (⚙️) - Opens settings modal
- **Center**: Game mode toggle capsule
  - Two buttons: "Practice" and "Game"
  - Inactive state: transparent background, gray text (#999)
  - Active state: white background with subtle shadow (elevation: 2)
  - Container: gray background (#e0e0e0), borderRadius: 20, padding: 4px
  - Smooth transitions between states
- **Right**: User profile icon (👤) - Placeholder for future functionality

**Styling**:
- flexDirection: 'row'
- justifyContent: 'space-between'
- paddingHorizontal: 20
- paddingVertical: 12

---

## Main Card Interface

### Card Stack Design
**Visual Hierarchy**: Three-card stack with staggered positioning
- **Front Card** (Active): Full size, full interactivity
- **Back Cards**: Peek visible, scaled down (96%, 92%), offset by 12px each
- **Stack Effect**: Subtle shadows and depth create depth perception

**Card Dimensions**:
- Width: `width - 40` (device width minus 20px padding each side)
- Height: 480px
- borderRadius: 24px
- Box Shadow: offset (0, 12), opacity 0.15, radius 24

**Card Content Structure**:
1. **Visual Container** (Top 2/3):
   - backgroundColor: #f0f7ff (light blue)
   - Large emoji/icon (fontSize: 80)
   
2. **Question Container** (Bottom 1/3):
   - Centered question text
   - fontSize: 18
   - fontWeight: 700
   - lineHeight: 24

### Card Types

#### Swipe Cards
Users answer by swiping left/right with optional up swipe.
- **Left Swipe**: Red gradient overlay (unsafe)
- **Right Swipe**: Green gradient overlay (safe)
- **Up Swipe**: Yellow gradient overlay (not sure)

**Control Hints Below Card**:
Three horizontal hint badges showing:
- Left arrow + "Unsafe" (red #ff6b6b)
- Up arrow + "Not Sure" (yellow #ffd700)
- Right arrow + "Safe" (green #51cf66)

#### Multiple Choice Cards
Users tap one of four option buttons arranged in 2x2 grid.
- Grid: 2 columns, 45% each
- Button styles:
  - Default: white background, border #e0e0e0, borderRadius: 16
  - Correct selection: #e8f5e9 background, #51cf66 border
  - Incorrect selection: #ffebee background, #ff6b6b border
  - Hint (correct unselected): #e8f5e9 background with 60% opacity

---

## Swipe Animation & Feedback

### Tinder-Style Rotation
- **Max Rotation**: 30 degrees (not full 360)
- **Formula**: `(dx / width) * 30`
- **Scale**: Cards scale down as swiped further
  - Min scale: 0.95
  - Formula: `1 - Math.abs(dx) / (width * 3)`

### Gradient Color Feedback
**Real-time color overlay** shows user's intended answer:
- **Interpolation**: Based on pan.x (horizontal position)
- **Left (-width/2)**: Red (#ff6b6b) = Unsafe
- **Center (0)**: White (#ffffff) = Neutral
- **Right (width/2)**: Green (#51cf66) = Safe
- **Opacity**: Increases as user swipes further, max 1.0

### Swipe Release Logic
**Horizontal Swipe**:
- Threshold: 30% of screen width OR velocity > 0.5
- Right swipe = Safe answer
- Left swipe = Unsafe answer
- Correct answer triggers immediate next card
- Incorrect answer shows modal with explanation

**Vertical Swipe (Up)**:
- Threshold: 25% of screen height OR velocity < -0.8
- Action: "Not sure" - shows answer modal without feedback
- Motion: Card animates upward off-screen

**Snap Back**:
- If swipe doesn't meet threshold, card snaps back with spring animation

---

## Game Mode Timer

### Timer Display
- **Position**: Top center of card, absolute positioned
- **Style**: Dark semi-transparent background (rgba(0,0,0,0.85))
- **Text Color**: Green (#51cf66) normally, Red (#ff6b6b) when < 3 seconds
- **Format**: M:SS (e.g., "0:05")
- **Text**: Monospace font, bold

### Timer Behavior
**Practice Mode**: No timer, infinite time
**Game Mode**: 
- Default: 5 seconds per question
- **Adjustable**: 3-30 seconds via settings
- **Expiration Logic**: When timer reaches 0 and no answer given:
  - Treats as incorrect answer
  - Shows feedback modal: "Time Expired" / "Time's up!"
  - Shows correct answer
  - Resets on next card

---

## Answer Feedback Modal

### Modal Structure
**Appearance**:
- Full-screen overlay with semi-transparent backdrop (rgba(0,0,0,0.5))
- Centered card modal
- Width: device width - 40
- Max height: 75% of device height
- borderRadius: 24
- Animation: Fade in/out

### Content Sections

**Title**:
- Large emoji + text: "✓ Correct!" or "✗ Incorrect"
- fontSize: 24, fontWeight: 700

**Answer Indicator Box**:
- Correct: green (#e8f5e9) background, left border (#51cf66)
- Incorrect: red (#ffebee) background, left border (#ff6b6b)
- Shows user's answer or "Time's up!"

**Correct Answer Box** (only shown if incorrect):
- Green background (#e8f5e9)
- Left border (#51cf66)
- Shows the actual correct answer

**Explanation Box**:
- Light gray background (#f5f5f5)
- Title: "Why?"
- Explanation text from card data

**Next Card Button**:
- Full-width button at bottom
- backgroundColor: #51cf66
- paddingVertical: 14
- borderRadius: 12
- Text: "Next Card" (white, fontWeight: 700)

---

## Settings Modal

### Layout
**Header**:
- Title: "Settings"
- Close button (X icon) top right
- Sticky/non-scrolling

**Content Area** (ScrollView):
- Vertical padding: 20px

### Game Mode Time Setting
**Custom Slider Implementation** (no external Slider package):

**Progress Bar**:
- Container: 8px height, gray background (#e0e0e0), borderRadius: 4
- Fill: Green (#51cf66), width changes based on value
- Formula: `((gameTime - 3) / (30 - 3)) * 100%`

**Plus/Minus Controls**:
- Two circular buttons (48x48) on ends
- Minus button: decrements by 1 (min: 3)
- Plus button: increments by 1 (max: 30)
- Center display: Current time value in green (#51cf66)
- Button style: borderRadius: 24, borderColor: #e0e0e0

**Range Labels**: "3s" (left), "30s" (right)

### Info Section
**Static Info Box**:
- Dark text on light gray background
- Bullet points explaining timer behavior
- Key points:
  - Practice Mode: Answer at your own pace
  - Game Mode: Race against the clock
  - Time expires: Question treated as incorrect

**Styling**:
- White background cards
- borderRadius: 16
- padding: 16
- Subtle shadows (elevation: 2)
- margin: 20px bottom

---

## State Management

### Core States
```javascript
const [mode, setMode] = useState('practice' | 'game')
const [cardIndex, setCardIndex] = useState(number)
const [gameTime, setGameTime] = useState(3-30)
const [timer, setTimer] = useState(number)
const [showAnswerModal, setShowAnswerModal] = useState(boolean)
const [isCorrect, setIsCorrect] = useState(boolean)
const [selectedAnswer, setSelectedAnswer] = useState(string | boolean | null)
const [swipeDirection, setSwipeDirection] = useState('left' | 'right' | 'up' | null)
const [showSettingsModal, setShowSettingsModal] = useState(boolean)
```

### Animation Values
```javascript
const pan = useRef(new Animated.ValueXY()).current
const rotate = useRef(new Animated.Value(0)).current
const scale = useRef(new Animated.Value(1)).current
const gradientOpacity = useRef(new Animated.Value(0)).current
```

### Effects
1. **Timer Countdown**: Runs when mode === 'game' && timer > 0
2. **Timer Expiration**: Triggers answer modal when timer === 0 && no answer
3. **Mode Changes**: Reset appropriate states when switching modes

---

## Card Data Structure

```typescript
interface CardData {
  id: number
  question: string
  image: string (emoji)
  type: 'swipe' | 'choice'
  correctAnswer: boolean | string
  options?: string[] (for choice type)
  explanation?: string
}
```

### Sample Cards
- Swipe cards: Boolean answers (safe/unsafe)
- Choice cards: Multiple option answers
- All include explanations for learning

---

## Key Implementation Details

### Gesture Handling
**PanResponder** detects:
- Horizontal movement (swipe left/right)
- Vertical movement (swipe up)
- Velocity for momentum-based decisions

### Card Stack Navigation
- Circular deck: After last card, loops to first
- Stack shows next cards with actual content
- Smooth transitions to new cards

### Accessibility
- Clear visual feedback for all actions
- Color + text labeling (not color alone)
- Hit targets: minimum 48x48 for buttons

---

## Transition Animations

### Swipe Out
- **Duration**: 300ms
- **Type**: Timing animation
- Cards exit smoothly to edges

### Spring Back
- **Type**: Spring animation
- Used when swipe doesn't meet threshold
- Snappy, responsive feel

### Modal Fade
- **animationType**: 'fade'
- Smooth appearance/disappearance

---

## Typography

- **Headers**: fontSize 24-28, fontWeight 700
- **Labels**: fontSize 13-16, fontWeight 600
- **Body Text**: fontSize 13-14, fontWeight 400-600
- **Monospace**: Timer text uses monospace font

---

## Future Enhancement Hooks

These elements are scaffolded for future features:
- **Settings Icon**: Opens modal (ready for more settings)
- **User Icon**: Placeholder for user profile/authentication
- **Game Mode**: Time pressure mechanic implemented
- **Card Deck**: Extensible for real database integration

---

## Development Notes

### Files
- Main component: `app/(tabs)/index.tsx`
- No external UI library dependencies (custom components)
- Uses Expo and React Native core

### Key Libraries Used
- **react-native**: Core components and animations
- **expo-router**: Navigation
- **@expo/vector-icons**: Feather icons

### Performance Considerations
- Animated values use native driver where possible
- Card stack uses efficient rendering
- Modals use ScrollView for long content

---

## Testing Scenarios

1. **Swipe Left**: Red gradient, unsafe action
2. **Swipe Right**: Green gradient, safe action
3. **Swipe Up**: Yellow gradient, not sure action
4. **Multiple Choice**: Tap option, show feedback
5. **Correct Answer**: Skip modal, move to next
6. **Incorrect Answer**: Show modal with explanation
7. **Game Mode Timer**: Count down, expire at 0
8. **Settings Adjustment**: Change time, apply to next game
9. **Practice Mode**: No timer pressure
10. **Card Deck**: Cycle through all cards, loop back

---

This specification captures all visual, behavioral, and technical details needed to replicate the DriveSwipe frontend interface.
