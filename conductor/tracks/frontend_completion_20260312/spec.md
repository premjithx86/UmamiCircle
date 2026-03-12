# Specification: Frontend Completion - Auth, Feed, Creation, and UX

## Overview
This track focuses on transforming the `umami-frontend` from a collection of detail pages and placeholders into a fully operational social media application. This includes full authentication integration, building the main feed and discovery interfaces, implementing the content creation pipeline, ensuring a polished dark mode experience, and adding administrative insights.

## Objectives
1.  **Comprehensive Auth Integration:** Full Firebase integration including Email/Password (with Forgot Password), Google OAuth, and profile synchronization.
2.  **Core Application Flow:** Build functional Home (following feed), Explore (discovery), Search, and Notifications pages.
3.  **User Management:** Implement a Settings page for managing blocks, bookmarks, and profile shortcuts.
4.  **Content Creation:** Implement the UI and logic for users to create and upload posts and recipes with moderation feedback.
5.  **Admin Insights:** Enhance the Admin Panel with a "CMS Coming Soon" placeholder and a "Top Countries" demographic chart.
6.  **UX Polish:** Complete Dark Mode implementation and ensure a responsive, high-performance UI.

## Functional Requirements

### 1. Authentication & User State
- **Signup/Login:** Functional forms integrated with Firebase Auth.
- **Google OAuth:** "Sign in with Google" support on the Login page.
- **Forgot Password:** Implementation of the password reset flow.
- **Signup Details:** Include a **Date of Birth** field during user registration.
- **Persistence:** Maintain user session across reloads.
- **Auth Guard:** Redirect unauthenticated users to `/login` for protected routes.
- **User Sync:** Ensure frontend user data is synced with the MongoDB backend (`/api/users/sync`).

### 2. Main Discovery & Engagement
- **Home Feed:** Fetch and display posts from users the current user follows.
- **Explore Page:** Display a grid of recent/trending posts and recipes.
- **Search Page:** Comprehensive search functionality for:
    - Keywords (captions/titles)
    - Tags
    - Categories
    - Users
- **Notifications:** Real-time notification list (likes, follows, comments) using Socket.io.

### 3. User Settings & Management
- **Settings Page:** Accessible from the profile/sidebar, providing:
    - **Blocked Users:** List of blocked accounts with unblock option.
    - **Bookmarks:** Access to saved posts and recipes.
    - **Profile Shortcut:** Quick link to the Edit Profile form.

### 4. Content Creation Pipeline
- **Create Post:** Modal or page to upload an image, write a caption, and add tags.
- **Create Recipe:** Detailed form for title, description, ingredients, steps, and image.
- **Moderation Feedback:** Handle and display errors from the backend moderation pipeline.

### 5. Admin Panel Enhancements
- **CMS Placeholder:** Add a "CMS Coming Soon" page to the admin sidebar.
- **Dashboard Analytics:** Implement a "Top Countries" chart on the main admin dashboard to show user demographics.

### 6. UI/UX & Dark Mode
- **Theme Switcher:** Accessible toggle for light/dark mode.
- **Tailwind Dark Mode:** Ensure every component has appropriate `dark:` classes.
- **Loading & Error States:** Consistent skeletons and error handling.

## Success Criteria
- Users can sign up (with DOB), log in via Email or Google, and reset their password.
- The home feed, explore, and search pages function correctly.
- Users can manage blocks and bookmarks via the Settings page.
- Admin dashboard displays the Top Countries demographic chart.
- Dark mode is visually consistent across the entire platform.
