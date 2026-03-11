# Specification: Real-time Messaging and Chat System

## Overview
This track adds private messaging capabilities between users, powered by Socket.io for real-time delivery. It includes the backend models/routes and the frontend chat interface.

## Objectives
1. Implement the Message and Conversation schemas.
2. Setup a Socket.io server and client integration for real-time events.
3. Build a robust private messaging UI.

## Functional Requirements
- **Conversation System:**
    - Group messages into conversations between two users.
    - List recent conversations with last message previews.
- **Messaging:**
    - Send/Receive text messages in real-time.
    - Seen/Read status indicators.
    - Message history with infinite scroll.
- **Real-time Engine:**
    - Handle "typing..." indicators.
    - Online/Offline status for users.
- **Safety:**
    - Blocked users cannot message each other.
    - Link preview generation (optional but recommended).

## Success Criteria
- Users can start a conversation from a profile.
- Messages are delivered instantly without page refresh.
- Conversation list updates automatically with new messages.
- Blocked users are restricted from sending messages.
