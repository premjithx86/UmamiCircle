# Specification: Content Creation & Moderation Pipeline

## Overview
This track implements the core content creation features for UmamiCircle, including Post and Recipe models, a sophisticated image upload moderation pipeline, and text moderation for user-generated content.

## Objectives
1. Define MongoDB models for Posts and Recipes.
2. Implement an image upload pipeline with:
   - MD5 Hash deduplication (prevent re-uploading identical images).
   - Sightengine API for NSFW/Safety detection.
   - Google Cloud Vision API for food recognition (ensure only food/recipes are posted).
   - Cloudinary integration for permanent storage.
3. Implement text moderation using:
   - `obscenity` (NPM package) for basic profanity filtering.
   - Groq API for food relevance and quality validation.

## Functional Requirements
- Users can create Posts with images and captions.
- Users can create Recipes with ingredients, steps, and images.
- All uploaded images must pass NSFW and "food-only" checks.
- All captions and recipe text must pass profanity and food-relevance checks.
- Duplicate images (same MD5 hash) should not be re-processed or re-uploaded to Cloudinary.

## Non-Functional Requirements
- High performance in moderation pipeline (asynchronous where possible).
- Accurate detection of food items.
- Secure storage of API keys.

## Success Criteria
- Posts and Recipes are successfully saved to MongoDB.
- NSFW images are rejected with appropriate error messages.
- Non-food images are rejected.
- Profane text is rejected or sanitized.
- No redundant Cloudinary storage for identical images.
