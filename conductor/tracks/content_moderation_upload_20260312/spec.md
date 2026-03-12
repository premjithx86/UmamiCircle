# Specification: Content Moderation & Upload Pipeline Connection

## Overview
This track connects the frontend content creation forms to the backend moderation pipeline. It ensures that all uploaded images and text are vetted for safety and relevance (food-related content) before being stored and published.

## Objectives
1.  **Dedicated Upload Endpoint:** Implement `POST /api/upload` to handle image moderation and Cloudinary storage independently of post/recipe creation.
2.  **Real Moderation Integration:** Replace mocks in `moderationService.js` with real calls to Sightengine (NSFW) and Google Cloud Vision (Food detection).
3.  **Simple API Key for Vision:** Update the Google Cloud Vision integration to use `GOOGLE_VISION_KEY` as a simple REST API key instead of a service account JSON.
4.  **Frontend UX Enhancements:** 
    - Display "Checking your image..." during the moderation process.
    - Show specific inline error messages for both image and text moderation failures.
5.  **Flow Optimization:** Update `CreatePost.jsx` and `CreateRecipe.jsx` to use the new upload endpoint and redirect to detail pages upon successful creation.

## Functional Requirements

### 1. Backend Moderation API
- **`POST /api/upload`:**
    - Accepts a single image file.
    - Runs the moderation pipeline:
        - Image Deduplication (MD5 Hash).
        - NSFW Check (Sightengine).
        - Food Content Check (Google Cloud Vision using `GOOGLE_VISION_KEY`).
    - Returns `imageUrl` and `imageHash` on success.
- **`POST /api/posts` & `POST /api/recipes`:**
    - Support accepting an optional `imageUrl` and `imageHash` in the body if the image was pre-uploaded.
    - Continue to support direct file upload for backward compatibility or single-step flows.

### 2. Moderation Service Updates
- **Sightengine:** Integrate real API calls using `SIGHTENGINE_API_USER` and `SIGHTENGINE_API_SECRET`.
- **Google Vision:** Implement a REST call to `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_KEY}` to verify food content (Labels or Object Localization).
- **Groq:** Ensure text moderation for captions/descriptions uses the Groq API to validate food relevance.

### 3. Frontend Implementation
- **Loading State:** Implement a blocking overlay or specific status text "Checking your image..." when the upload/moderation is in progress.
- **Error Handling:** 
    - Capture 400 errors from the backend.
    - Parse the `error` field from the JSON response.
    - Display the error message near the relevant field (image or text).
- **Navigation:** Use `useNavigate` to redirect the user to `/posts/:id` or `/recipes/:id` after successful creation.

## Success Criteria
- Images failing the Sightengine NSFW check are rejected with a clear message.
- Non-food images are rejected by the Google Vision step.
- Profane or non-food related text is rejected or censored as per middleware logic.
- Users see a "Checking your image..." spinner during the process.
- Successful uploads result in immediate redirection to the new content's page.
