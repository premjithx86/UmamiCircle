# Implementation Plan: Content Creation & Moderation Pipeline

## Phase 1: Models and Infrastructure
- [x] Task: Create Post and Recipe Models (f0bf7dc)
    - [x] Define Mongoose schema for `Post` in `src/models/Post.js`.
    - [x] Define Mongoose schema for `Recipe` in `src/models/Recipe.js`.
    - [x] Add basic unit tests for the models.
- [ ] Task: Create Content Moderation Service
    - [ ] Initialize `src/services/moderationService.js`.
    - [ ] Configure `Sightengine`, `Google Cloud Vision`, `Cloudinary`, and `Groq` API integrations.
    - [ ] Implement image hash deduplication logic.

## Phase 2: Moderation Logic & Image Pipeline
- [ ] Task: Implement Image Moderation Pipeline
    - [ ] Create `src/middleware/uploadMiddleware.js` using `multer`.
    - [ ] Implement `checkImageSafety` using Sightengine.
    - [ ] Implement `verifyFoodContent` using Google Cloud Vision.
    - [ ] Integrate Cloudinary for image storage.
- [ ] Task: Implement Text Moderation
    - [ ] Set up `obscenity` package for profanity filtering.
    - [ ] Implement `validateFoodRelevance` using Groq API.

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
