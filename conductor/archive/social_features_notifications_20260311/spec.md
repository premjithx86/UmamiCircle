# Specification: Social Features, Engagement, and Notifications

## Overview
This track implements the core social interactions for UmamiCircle, allowing users to build relationships (follow, block, report) and engage with content (like, comment, bookmark, share). It also includes a robust notification system to keep users informed of social activity in real-time.

## Objectives
1. Implement User Relationship features: Follow/Unfollow, Block/Report.
2. Implement Content Engagement features: Like, Comment, Bookmark, Share.
3. Implement a Notification system: Schema and real-time alerts.

## Functional Requirements
- **Follow System:** Users can follow/unfollow others.
- **User Control:** Users can block/unblock others. Users can report inappropriate profiles/content.
- **Content Engagement:**
    - Like/Unlike Posts and Recipes.
    - Comment on Posts and Recipes.
    - Bookmark (save) Posts and Recipes.
    - Share Post/Recipe (link generation/tracking).
- **Notifications:**
    - Trigger notifications for follows, likes, comments, and reports (admin-only).
    - Real-time updates via Socket.io.
    - Mark notifications as read.

## Non-Functional Requirements
- High responsiveness for social actions.
- Efficient notification delivery (avoiding database bloat).
- Real-time performance for messaging/alerts.

## Success Criteria
- Follow/Following counts updated correctly.
- Likes, Comments, and Bookmarks reflected in DB and UI.
- Notifications generated and delivered in real-time.
- Blocked users cannot interact with the blocker.
