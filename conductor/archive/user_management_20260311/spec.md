# Track Specification: User Management: Database Models and Authentication Integration

## Overview
This track focuses on establishing user profiles and deeper integration with Firebase Authentication.

## Objectives
- Create the User database model (Mongoose).
- Implement registration and login API endpoints that synchronize with Firebase tokens.
- Allow users to update their profile information (Bio, Profile Picture URL).

## Functional Requirements
- Define User schema with fields: `firebaseUID`, `username`, `name`, `email`, `gender`, `country`, `bio`, `profilePicUrl`, `followers`, `following`, `blocked`, `isBlocked`, `role`.
- Create a `POST /api/users/sync` endpoint that receives a Firebase token, verifies it, and ensures a corresponding User document exists in MongoDB.
- Create `GET /api/users/me` and `PUT /api/users/me` for profile management.
- **Security:** Ensure `role` field is stripped from all user-facing update requests.

## Non-Functional Requirements
- Ensure unique usernames and emails in MongoDB.
- Secure profile update routes with `authMiddleware`.

## Success Criteria
- Successful synchronization of Firebase users with MongoDB.
- Profiles can be retrieved and updated through protected routes.
