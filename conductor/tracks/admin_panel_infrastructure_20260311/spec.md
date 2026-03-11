# Specification: Admin Panel - Infrastructure and User Management

## Overview
This track builds the administrative backbone of UmamiCircle. It provides a separate interface for staff to monitor platform health, manage users, and view key metrics.

## Objectives
1. Implement the Admin Panel scaffolding (API and Frontend).
2. Setup Admin Dashboard with real-time platform metrics.
3. Build the User Management module (search, view, suspend, delete).

## Functional Requirements
- **Admin Authentication:**
    - Separate login for admins (JWT-based).
    - Role-based access control (Staff, Admin, SuperAdmin).
- **Admin Dashboard:**
    - Key performance indicators (Total Users, Daily Posts, Active Sessions).
    - Real-time activity ticker.
- **User Management:**
    - List view of all registered users.
    - Detailed user view (activity history, reports against them).
    - Actions: Suspend user, Reset password (admin only), or Deactivate account.
- **Admin Sidebar:**
    - Unified navigation for Dashboard, Users, Content, Reports, and Logs.

## Success Criteria
- Admins can log in securely to the dedicated `/admin` area.
- Dashboard displays live or near-live platform metrics.
- User management allows finding and managing specific accounts.
- Admin actions are securely restricted to authorized accounts.
