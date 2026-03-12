# Implementation Plan: Content Moderation & Upload Pipeline

## Phase 1: Backend Moderation API Enhancements
- [x] Task: Update `moderationService.js` for Real API Integration (623bb86)
    - Replace mocks with real fetch/SDK calls for Sightengine and Hugging Face.
    - Implement Hugging Face food detection using `HUGGINGFACE_API_KEY` (REST API).
    - Ensure Cloudinary, Sightengine, Hugging Face, and Groq keys are used from `process.env`.
    - **Fix:** Corrected Sightengine call to use `multipart/form-data` with `axios` and `form-data` package.
    - **Improvement:** Implemented tag filtering for profanity and food relevance in `textModerationMiddleware.js`.
    - **Improvement:** Implemented image deduplication and caching using MD5 hashes and `ModerationCache` collection.
- [x] Task: Create `uploadRoutes.js` (acf4124)
    - Implement `POST /api/upload` endpoint.
    - Integrate `processImageModeration` middleware.
- [x] Task: Update Post/Recipe Routes for Pre-uploaded Images (acf4124)
    - Modify `POST /api/posts` and `POST /api/recipes` to handle both file uploads and pre-moderated image URLs.
- [x] Task: Backend Validation Tests (f684e23)
    - Write tests using `supertest` to verify that non-food images are rejected.
    - Verify that safe, food-related images are accepted and uploaded.

## Phase 2: Frontend Connection & UX
- [x] Task: Update `CreatePost.jsx` (ec47cd8)
    - Refactor to call `/api/upload` first or handle the combined call with specific loading states.
    - Implement "Checking your image..." loading indicator.
    - Add inline error display for moderation rejections.
    - Implement `useNavigate` redirection to the new post page.
- [x] Task: Update `CreateRecipe.jsx` (acf4124)
    - Implement similar moderation feedback and redirection logic.
- [x] Task: Global Error Handling for Moderation (acf4124)
    - Ensure text moderation (Groq) errors are also displayed clearly to the user.

## Phase: Final Verification
- [x] Task: End-to-End Test - Post Creation (acf4124)
    - Verify successful flow from image selection to redirection.
- [x] Task: End-to-End Test - Recipe Creation (acf4124)
    - Verify successful flow.
- [x] Task: Moderation Edge Cases (acf4124)
    - Confirm rejection of NSFW content.
    - Confirm rejection of non-food content.
