# Implementation Plan: Frontend Completion - Auth, Feed, Creation, and UX

## Phase 1: Authentication & User State [checkpoint: 4b80cdd]
- [x] Task: Firebase Auth Integration Enhancements (f684e23)
    - Setup Firebase Google Auth provider.
    - Implement "Sign in with Google" on the Login page.
    - Build "Forgot Password" modal and flow.
- [x] Task: Signup Page Update (4a55fee)
    - Add Date of Birth field to the signup form.
    - Update validation and sync logic to include DOB.
- [x] Task: User Synchronization & Auth Guard (28101a2)
    - Call `/api/users/sync` on successful Firebase login/signup (including Google).
    - Implement protected route wrapper (Auth Guard) to redirect to `/login`.

## Phase 2: Core Discovery Pages
- [ ] Task: Functional Home Feed
    - Fetch posts from followed users using `/api/posts/following`.
    - Implement scroll-based pagination.
- [ ] Task: Explore Page Implementation
    - Build grid for all posts/recipes with "Trending" filter.
- [ ] Task: Search Page Implementation
    - Build comprehensive search interface.
    - Implement filtering by keywords, tags, categories, and users.
- [ ] Task: Real-time Notifications
    - Connect to Socket.io for live updates.
    - Build notifications page/dropdown.

## Phase 3: Content Creation flow
- [ ] Task: Create Post Implementation
    - Image upload with preview.
    - Caption and tag input.
    - Success/Error handling from moderation pipeline.
- [ ] Task: Create Recipe Implementation
    - Multi-step form for recipe details.
    - Ingredient list and instruction steps.

## Phase 4: User Settings & Admin Enhancements
- [ ] Task: Settings Page Implementation
    - Build Blocked Users list with unblock action.
    - Build Bookmarks view for saved content.
    - Add shortcut to Edit Profile.
- [ ] Task: Admin Panel Updates
    - Add "CMS Coming Soon" placeholder page and sidebar link.
    - Implement "Top Countries" chart on the Admin Dashboard.

## Phase 5: UI/UX Polish & Dark Mode
- [ ] Task: Dark Mode Full Audit
    - Ensure all components (including new pages) look good in dark mode.
    - Implement theme switcher in navigation.
- [ ] Task: Performance & Responsive Check
    - Final polish on mobile responsiveness and loading skeletons.

## Phase: Final Verification
- [ ] Task: End-to-End Auth & Password Reset check
- [ ] Task: Search and Discovery functionality check
- [ ] Task: Content creation and Admin dashboard verification
