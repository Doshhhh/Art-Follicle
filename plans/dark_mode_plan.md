# Dark Mode Implementation Plan

## Current Site Analysis

### Current Color Scheme
- **Text Color**: `#101018` (very dark gray/black)
- **Muted Color**: `#4a4a5a` (medium gray)
- **Primary Color**: `#842bff` (purple/violet)
- **Background**: `#ffffff` (white)
- **Border Color**: `#e5e5f0` (light gray)
- **Secondary Backgrounds**: `#f8f8fc`, `#f4f4fb` (light purple/blue grays)

### Site Structure
- Fixed header with navigation
- Multiple sections with different background colors
- Complex responsive design with mobile menu
- Existing CSS variables system in place

## Implementation Strategy

### 1. Dark Theme Color Palette

**Dark Theme Variables:**
```css
:root[data-theme="dark"] {
  --text-color: #f5f5f5;
  --muted-color: #a8a8b8;
  --primary-color: #a855f7; /* Slightly lighter for better visibility */
  --background: #121218;
  --border-color: #3a3a4a;
  --surface-color: #1a1a24;
  --surface-light: #22222e;
  --shadow-color: rgba(0, 0, 0, 0.3);
}
```

### 2. SVG Icons for Theme Toggle

**Sun Icon (Light Theme):**
```svg
<svg class="theme-icon theme-icon--sun" viewBox="0 0 24 24" width="20" height="20">
  <circle cx="12" cy="12" r="5" fill="currentColor"/>
  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
</svg>
```

**Moon Icon (Dark Theme):**
```svg
<svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" width="20" height="20">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
</svg>
```

### 3. HTML Structure Changes

Add theme toggle button to header:
```html
<button class="theme-toggle" type="button" aria-label="Toggle dark mode">
  <svg class="theme-icon theme-icon--sun" viewBox="0 0 24 24" width="20" height="20">
    <!-- sun icon paths -->
  </svg>
  <svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" width="20" height="20">
    <!-- moon icon paths -->
  </svg>
</button>
```

### 4. CSS Implementation

**Button Styling:**
```css
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.theme-icon {
  position: absolute;
  transition: all 0.3s ease;
}

.theme-icon--sun {
  opacity: 1;
  transform: scale(1);
}

.theme-icon--moon {
  opacity: 0;
  transform: scale(0.8);
}

[data-theme="dark"] .theme-icon--sun {
  opacity: 0;
  transform: scale(0.8);
}

[data-theme="dark"] .theme-icon--moon {
  opacity: 1;
  transform: scale(1);
}
```

**Header Layout Adjustments:**
```css
/* Desktop layout - add to header__actions */
.header__actions {
  display: flex;
  align-items: center;
  gap: 12px; /* Increased gap to accommodate theme toggle */
}

/* Mobile layout - position near burger menu */
@media (max-width: 960px) {
  .header__actions {
    gap: 8px;
  }
}

@media (max-width: 640px) {
  .menu-toggle {
    margin-right: 8px; /* Space between burger and theme toggle */
  }
}
```

### 5. JavaScript Implementation

**Theme Switching Logic:**
```javascript
// Theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or system preference
const checkThemePreference = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    return savedTheme;
  }
  
  if (systemPrefersDark) {
    return 'dark';
  }
  
  return 'light';
};

// Apply theme
const applyTheme = (theme) => {
  htmlElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update icon visibility
  const sunIcon = themeToggle.querySelector('.theme-icon--sun');
  const moonIcon = themeToggle.querySelector('.theme-icon--moon');
  
  if (theme === 'dark') {
    sunIcon.style.opacity = '0';
    sunIcon.style.transform = 'scale(0.8)';
    moonIcon.style.opacity = '1';
    moonIcon.style.transform = 'scale(1)';
  } else {
    sunIcon.style.opacity = '1';
    sunIcon.style.transform = 'scale(1)';
    moonIcon.style.opacity = '0';
    moonIcon.style.transform = 'scale(0.8)';
  }
};

// Toggle theme
const toggleTheme = () => {
  const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
};

// Initialize theme
const initializeTheme = () => {
  const preferredTheme = checkThemePreference();
  applyTheme(preferredTheme);
  
  // Add event listener for toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
};

// Call on DOM load
document.addEventListener('DOMContentLoaded', initializeTheme);
```

### 6. Dark Theme Specific Styles

**Component-Specific Adjustments:**
```css
/* Header adjustments for dark theme */
[data-theme="dark"] .site-header {
  background: rgba(20, 20, 30, 0.65);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Button adjustments */
[data-theme="dark"] .button--ghost {
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  color: var(--text-color);
}

/* Input fields */
[data-theme="dark"] .input-field input {
  background: var(--surface-color);
  border: 2px solid var(--border-color);
}

/* Cards and surfaces */
[data-theme="dark"] .benefit-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
}

/* Modal adjustments */
[data-theme="dark"] .modal__content {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
}
```

### 7. Responsive Layout Considerations

**Desktop Layout:**
- Theme toggle button placed in header__actions
- Aligned with other header elements
- Consistent spacing

**Mobile Layout:**
- Positioned next to burger menu
- Fixed positioning for accessibility
- Proper spacing and touch target size

### 8. Implementation Timeline

1. **Phase 1**: Add CSS variables and dark theme styles
2. **Phase 2**: Create SVG icons and add HTML structure
3. **Phase 3**: Implement JavaScript logic
4. **Phase 4**: Test across devices and browsers
5. **Phase 5**: Refine and optimize

### 9. Testing Plan

**Functional Tests:**
- Toggle button works correctly
- Theme persists on page reload
- System preference detection works
- Icons switch properly

**Visual Tests:**
- All text remains readable
- Brand colors maintain identity
- Contrast ratios meet accessibility standards
- No visual glitches during transition

**Responsive Tests:**
- Mobile layout works correctly
- Tablet layout maintains usability
- Desktop layout looks polished

### 10. Accessibility Considerations

- Proper ARIA labels for theme toggle
- Sufficient color contrast
- Keyboard navigable
- Screen reader friendly
- Reduced motion preferences respected