# Specification: Frontend Completion - Auth, Feed, Creation, and UX

## Overview
This track focuses on transforming the `umami-frontend` from a collection of detail pages and placeholders into a fully operational social media application. This includes full authentication integration, building the main feed and discovery interfaces, implementing the content creation pipeline, and ensuring a polished dark mode experience.

## Objectives
1.  **Firebase Auth Integration:** Replace placeholder auth logic with full Firebase integration (Login, Signup, Auth State).
2.  **Core Application Flow:** Build functional Home (following feed), Explore (discovery), and Notifications pages.
3.  **Content Creation:** Implement the UI and logic for users to create and upload posts and recipes, including image selection and text input.
4.  **UX Polish:** Complete the Dark Mode implementation across all components and ensure a responsive, high-performance UI.

## Functional Requirements

### 1. Authentication & User State
- **Signup/Login:** Fully functional forms integrated with Firebase Auth.
- **Persistence:** Maintain user session across reloads.
- **Auth Guard:** Redirect unauthenticated users to `/login` for protected routes.
- **User Sync:** Ensure frontend user data is synced with the MongoDB backend (`/api/users/sync`).

### 2. Main Discovery & Engagement
- **Home Feed:** Fetch and display posts from users the current user follows.
- **Explore Page:** Display a grid of recent/trending posts and recipes from the entire platform.
- **Notifications:** Real-time notification list (likes, follows, comments) using Socket.io.

### 3. Content Creation Pipeline
- **Create Post:** Modal or page to upload an image, write a caption, and add tags.
- **Create Recipe:** Detailed form for title, description, ingredients, steps, and image.
- **Moderation Feedback:** Handle and display errors from the backend moderation pipeline (e.g., "Non-food content detected").

### 4. UI/UX & Dark Mode
- **Theme Switcher:** Accessible toggle for light/dark mode.
- **Tailwind Dark Mode:** Ensure every component has appropriate `dark:` classes.
- **Loading & Error States:** Consistent skeletons and error handling across all new pages.

## Success Criteria
- Users can sign up and stay logged in.
- The home feed successfully displays content from followed users.
- Users can successfully create and publish posts/recipes.
- Dark mode is visually consistent and togglable.
- All new pages follow the defined project style guides.
