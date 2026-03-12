# Implementation Plan: Content Moderation & Upload Pipeline

## Phase 1: Backend Moderation API Enhancements
- [ ] Task: Update `moderationService.js` for Real API Integration
    - Replace mocks with real fetch/SDK calls for Sightengine and Google Vision.
    - Implement Google Vision food detection using `GOOGLE_VISION_KEY` (REST API).
    - Ensure Cloudinary, Sightengine, Google Vision, and Groq keys are used from `process.env`.
- [ ] Task: Create `uploadRoutes.js`
    - Implement `POST /api/upload` endpoint.
    - Integrate `processImageModeration` middleware.
- [ ] Task: Update Post/Recipe Routes for Pre-uploaded Images
    - Modify `POST /api/posts` and `POST /api/recipes` to handle both file uploads and pre-moderated image URLs.
- [ ] Task: Backend Validation Tests
    - Write tests using `supertest` to verify that non-food images are rejected.
    - Verify that safe, food-related images are accepted and uploaded.

## Phase 2: Frontend Connection & UX
- [ ] Task: Update `CreatePost.jsx`
    - Refactor to call `/api/upload` first or handle the combined call with specific loading states.
    - Implement "Checking your image..." loading indicator.
    - Add inline error display for moderation rejections.
    - Implement `useNavigate` redirection to the new post page.
- [ ] Task: Update `CreateRecipe.jsx`
    - Implement similar moderation feedback and redirection logic.
- [ ] Task: Global Error Handling for Moderation
    - Ensure text moderation (Groq) errors are also displayed clearly to the user.

## Phase: Final Verification
- [ ] Task: End-to-End Test - Post Creation
    - Verify successful flow from image selection to redirection.
- [ ] Task: End-to-End Test - Recipe Creation
    - Verify successful flow.
- [ ] Task: Moderation Edge Cases
    - Confirm rejection of NSFW content.
    - Confirm rejection of non-food content.
