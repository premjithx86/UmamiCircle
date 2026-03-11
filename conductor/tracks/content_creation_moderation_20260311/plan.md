# Implementation Plan: Content Creation & Moderation Pipeline

## Phase 1: Models and Infrastructure
- [x] Task: Create Post and Recipe Models (f0bf7dc)
    - [x] Define Mongoose schema for `Post` in `src/models/Post.js`.
    - [x] Define Mongoose schema for `Recipe` in `src/models/Recipe.js`.
    - [x] Add basic unit tests for the models.
- [x] Task: Create Content Moderation Service (18e6009)
    - [x] Initialize `src/services/moderationService.js`.
    - [x] Configure `Sightengine`, `Google Cloud Vision`, `Cloudinary`, and `Groq` API integrations.
    - [x] Implement image hash deduplication logic.

## Phase 2: Moderation Logic & Image Pipeline
- [x] Task: Implement Image Moderation Pipeline (773195)
    - [x] Create `src/middleware/uploadMiddleware.js` using `multer`.
    - [x] Implement `checkImageSafety` using Sightengine.
    - [x] Implement `verifyFoodContent` using Google Cloud Vision.
    - [x] Integrate Cloudinary for image storage.
- [x] Task: Implement Text Moderation (773195)
    - [x] Set up `obscenity` package for profanity filtering.
    - [x] Implement `validateFoodRelevance` using Groq API.

## Phase 3: Content Creation API
- [ ] Task: Implement Create Post Endpoint
    - [ ] Create `src/routes/postRoutes.js`.
    - [ ] Implement `POST /api/posts` with full moderation pipeline.
- [ ] Task: Implement Create Recipe Endpoint
    - [ ] Create `src/routes/recipeRoutes.js`.
    - [ ] Implement `POST /api/recipes` with full moderation pipeline.

## Phase: Final Verification
- [ ] Task: Comprehensive Integration Testing
- [ ] Task: Manual Verification of Moderation Pipeline
