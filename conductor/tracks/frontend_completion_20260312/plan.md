# Implementation Plan: Frontend Completion - Auth, Feed, Creation, and UX

## Phase 1: Authentication & User State
- [ ] Task: Firebase Auth Integration
    - Setup Firebase project and client-side config.
    - Implement `AuthContext` for managing current user state.
    - Connect `Login` and `Signup` pages to Firebase.
- [ ] Task: User Synchronization
    - Call `/api/users/sync` on successful Firebase login/signup.
    - Implement logout functionality.

## Phase 2: Core Discovery Pages
- [ ] Task: Functional Home Feed
    - Fetch posts from followed users using `/api/posts/following`.
    - Implement scroll-based pagination.
- [ ] Task: Explore Page Implementation
    - Build grid for all posts/recipes with "Trending" filter.
- [ ] Task: Real-time Notifications
    - Connect to Socket.io for live updates.
    - Build notifications dropdown/page.

## Phase 3: Content Creation flow
- [ ] Task: Create Post Implementation
    - Image upload with preview.
    - Caption and tag input.
    - Success/Error handling from moderation pipeline.
- [ ] Task: Create Recipe Implementation
    - Multi-step form for recipe details.
    - Ingredient list and instruction steps.

## Phase 4: UI/UX Polish & Dark Mode
- [ ] Task: Dark Mode Full Audit
    - Ensure all components look good in dark mode.
    - Implement theme switcher in navigation.
- [ ] Task: Performance & Responsive Check
    - Final polish on mobile responsiveness and load states.

## Phase: Final Verification
- [ ] Task: End-to-End Auth flow check
- [ ] Task: Content creation and feed refresh check
