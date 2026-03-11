# Implementation Plan: Social Features, Engagement, and Notifications

## Phase 1: Models and Relationships [checkpoint: 5656bf8]
- [x] Task: Create Social Models (Comment, Notification, Report) (5fab622)
    - [ ] Define `Comment` schema (src/models/Comment.js).
    - [ ] Define `Notification` schema (src/models/Notification.js).
    - [ ] Define `Report` schema (src/models/Report.js).
    - [ ] Add basic unit tests for the models.
- [x] Task: Update Existing Models (User, Post, Recipe) (69556c8)
    - [ ] Add `bookmarks` to `User` model.
    - [ ] Add `likes` and `commentsCount` to `Recipe` model.
    - [ ] Verify model consistency and update tests.

## Phase 2: User Relationship API [checkpoint: 9693c52]
- [x] Task: Implement Follow/Unfollow Routes (40e44de)
    - [ ] Create `POST /api/social/follow/:id` and `POST /api/social/unfollow/:id`.
    - [ ] Implement logic to update both users' follow/following lists.
- [x] Task: Implement Block/Report Routes (d75045e)
    - [ ] Create `POST /api/social/block/:id` and `POST /api/social/unblock/:id`.
    - [ ] Create `POST /api/social/report/:type/:id` (User, Post, or Recipe).
    - [ ] Implement blocking logic to prevent interactions.

## Phase 3: Content Engagement API [checkpoint: a05a3e9]
- [x] Task: Implement Like/Unlike Routes (0d1fc42)
    - [ ] Create `POST /api/posts/like/:id` and `POST /api/recipes/like/:id`.
    - [ ] Implement toggle logic for likes.
- [x] Task: Implement Commenting Routes (7ffe29d)
    - [ ] Create `POST /api/comments` for both Posts and Recipes.
    - [ ] Create `GET /api/comments/:type/:id`.
    - [ ] Create `DELETE /api/comments/:id`.
- [x] Task: Implement Bookmarking/Sharing Routes (9174038)
    - [ ] Create `POST /api/social/bookmark/:type/:id`.
    - [ ] Create `POST /api/social/share/:type/:id`.

## Phase 4: Notification System & Real-time Alerts [checkpoint: 271399b]
- [x] Task: Implement Notification API (ba840fc)
    - [ ] Create `GET /api/notifications`.
    - [ ] Create `PUT /api/notifications/read/:id`.
    - [ ] Create `PUT /api/notifications/read-all`.
- [x] Task: Integrate Socket.io for Real-time Alerts (3ade71c)
    - [ ] Initialize Socket.io on the server.
    - [ ] Create a notification emitter service.
    - [ ] Connect social events (like, comment, follow) to the emitter.

## Phase: Final Verification
- [ ] Task: Comprehensive Integration Testing
- [ ] Task: Manual Verification of Social Workflows
