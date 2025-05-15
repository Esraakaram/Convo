# Backend API Documentation

This documentation covers all REST API endpoints and Socket.IO events for the chat backend. It is designed to be comprehensive and beginner-friendly, with example requests, responses, authentication details, and business logic explanations.

---

## Table of Contents
1. [Authentication & User Management](#authentication--user-management)
2. [User Social Actions (Friends & Blocking)](#user-social-actions-friends--blocking)
3. [Direct Messaging](#direct-messaging)
4. [Group Chat](#group-chat)
5. [Socket.IO Real-Time Events](#socketio-real-time-events)
6. [Data Models](#data-models)
7. [Authentication Details](#authentication-details)
8. [Error Handling](#error-handling)
9. [Business Logic & Notes](#business-logic--notes)

---

## Authentication & User Management

### POST `/api/auth/signup`
- **Purpose:** Register a new user account.
- **Request Body Example:**
  ```json
  {
    "fullName": "John Doe",         // Required: User's full name
    "email": "john@example.com",    // Required: User's email address
    "password": "StrongPassword123" // Required: Password (min 6 characters)
  }
  ```
- **Response Example:**
  - `201 Created` on success:
    ```json
    {
      "_id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profilePic": ""
    }
    ```
  - JWT token is set as an HTTP-only cookie.
- **Errors:** `400` for missing fields or weak password, `500` for server errors.

### POST `/api/auth/login`
- **Purpose:** Log in with email and password.
- **Request Body Example:**
  ```json
  {
    "email": "john@example.com",    // Required: User's email address
    "password": "StrongPassword123" // Required: User's password
  }
  ```
- **Response Example:**
  ```json
  {
    "_id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": ""
  }
  ```
- **Errors:** `400` for invalid credentials.

### POST `/api/auth/logout`
- **Purpose:** Log out the current user (removes JWT cookie).
- **Response:** `200 OK`.

### PUT `/api/auth/update-profile`
- **Purpose:** Update profile information.
- **Headers:** `Authorization: Bearer <JWT>` or JWT cookie
- **Request Body Example:**
  ```json
  {
    "fullName": "Jane Doe",             // Optional: New full name
    "phoneNumber": "1234567890",        // Optional: New phone number
    "profilePic": "https://..."         // Optional: New profile picture URL
  }
  ```
- **Response Example:**
  ```json
  {
    "_id": "...",
    "fullName": "Jane Doe",
    "email": "john@example.com",
    "profilePic": "https://..."
  }
  ```

### GET `/api/auth/check`
- **Purpose:** Check if the user is authenticated and fetch their info.
- **Headers:** `Authorization: Bearer <JWT>` or JWT cookie
- **Response:** `200 OK` with user info.

---

## User Social Actions (Friends & Blocking)

All endpoints below require authentication (JWT).

### POST `/api/auth/add-friend`
- **Purpose:** Add another user to your friends list.
- **Request Body Example:**
  ```json
  {
    "friendId": "<userId>" // Required: The user ID of the friend to add
  }
  ```
- **Logic:** Cannot add yourself. Cannot add if already friends.
- **Response Example:**
  ```json
  { "message": "Friend added" }
  ```

### POST `/api/auth/remove-friend`
- **Purpose:** Remove a user from your friends list.
- **Request Body Example:**
  ```json
  {
    "friendId": "<userId>" // Required: The user ID of the friend to remove
  }
  ```
- **Logic:** Must be in your friends list.
- **Response Example:**
  ```json
  { "message": "Friend removed" }
  ```

### POST `/api/auth/block-user`
- **Purpose:** Block a user (prevents messaging both ways).
- **Request Body Example:**
  ```json
  {
    "blockId": "<userId>" // Required: The user ID of the user to block
  }
  ```
- **Logic:** Cannot block yourself. Removes from friends if present.
- **Response Example:**
  ```json
  { "message": "User blocked" }
  ```

### POST `/api/auth/unblock-user`
- **Purpose:** Unblock a previously blocked user.
- **Request Body Example:**
  ```json
  {
    "blockId": "<userId>" // Required: The user ID of the user to unblock
  }
  ```
- **Logic:** Must be in your blocked list.
- **Response Example:**
  ```json
  { "message": "User unblocked" }
  ```

### GET `/api/auth/friends`
- **Purpose:** Get your list of friends.
- **Response:**
  ```json
  {
    "friends": [
      { "_id": "...", "fullName": "...", "email": "...", "profilePic": "..." },
      ...
    ]
  }
  ```

### GET `/api/auth/blocked`
- **Purpose:** Get your list of blocked users.
- **Response:**
  ```json
  {
    "blocked": [
      { "_id": "...", "fullName": "...", "email": "...", "profilePic": "..." },
      ...
    ]
  }
  ```

---

## Direct Messaging

All endpoints below require authentication (JWT).

### POST `/api/messages/send`
- **Purpose:** Send a direct (one-to-one) message.
- **Request Body Example:**
  ```json
  {
    "receiver": "<userId>", // Required: The user ID of the receiver
    "content": "Hello!"      // Required: The message content (string)
  }
  ```
- **Logic:** Cannot message blocked users (either direction). Content is required.
- **Response Example:**
  ```json
  {
    "message": "Message sent",
    "data": {
      "_id": "...",
      "sender": "...",
      "receiver": "...",
      "content": "Hello!",
      "createdAt": "..."
    }
  }
  ```

### GET `/api/messages/conversation/:otherUserId`
- **Purpose:** Fetch all messages between you and another user.
- **Response:** `{ "messages": [ ... ] }` (sorted by time ascending)

### GET `/api/messages/inbox`
- **Purpose:** Fetch the latest message from each conversation (your "inbox").
- **Response:** `{ "inbox": [ ... ] }`

### DELETE `/api/messages/:messageId`
- **Purpose:** Delete a message you sent.
- **Logic:** Only the sender can delete their own messages.
- **Response:** `200 OK` on success.

---

## Group Chat

### POST `/api/groups/`
- **Purpose:** Create a new group chat.
- **Request Body Example:**
  ```json
  {
    "name": "My Group",                 // Required: Group name
    "members": ["userId1", "userId2"], // Required: Array of user IDs to add to the group
    "description": "A fun group",        // Optional: Description of the group
    "avatar": "https://..."              // Optional: Avatar image URL
  }
  ```
- **Logic:** At least 2 members (plus creator) required. Creator is admin by default.
- **Response Example:**
  ```json
  {
    "group": {
      "_id": "...",
      "name": "My Group",
      "members": ["...", "...", ...],
      "admins": ["..."],
      "description": "A fun group",
      "avatar": "https://..."
    }
  }
  ```

### POST `/api/groups/:groupId/add-member`
- **Purpose:** Add a member to a group (admin only).
- **Request Body Example:**
  ```json
  {
    "userId": "<userId>" // Required: The user ID to add to the group
  }
  ```
- **Logic:** Only admins can add. Cannot add existing member.
- **Response Example:**
  ```json
  { "message": "Member added" }
  ```

### POST `/api/groups/:groupId/remove-member`
- **Purpose:** Remove a member from a group (admin only).
- **Request Body Example:**
  ```json
  {
    "userId": "<userId>" // Required: The user ID to remove from the group
  }
  ```
- **Logic:** Only admins can remove. Cannot remove last admin/member.
- **Response Example:**
  ```json
  { "message": "Member removed" }
  ```

### GET `/api/groups/:groupId`
- **Purpose:** Get group info (members, admins, etc).
- **Response:** `{ "group": { ... } }`

### GET `/api/groups/:groupId/messages`
- **Purpose:** Get all messages in a group (chronological).
- **Response:** `{ "messages": [ ... ] }`

### POST `/api/groups/:groupId/messages`
- **Purpose:** Send a message to a group.
- **Request Body Example:**
  ```json
  {
    "content": "Hello group!" // Required: The message content (string)
  }
  ```
- **Logic:** Must be a group member. Cannot send if blocked by any member.
- **Response Example:**
  ```json
  {
    "message": "Message sent",
    "data": {
      "_id": "...",
      "sender": "...",
      "group": "...",
      "content": "Hello group!",
      "createdAt": "..."
    }
  }
  ```

---

## Socket.IO Real-Time Events

Socket.IO is used for real-time chat. All events require a valid JWT token in the connection handshake:
```js
const socket = io("http://localhost:3000", { auth: { token: "<JWT>" } });
```

### `join`
- **Purpose:** Join your personal room to receive direct messages.
- **Payload:** none
- **Usage:**
  ```js
  socket.emit("join");
  ```

### `join-group`
- **Purpose:** Join a group chat room to receive group messages.
- **Payload:** `groupId` (string)
- **Usage:**
  ```js
  socket.emit("join-group", groupId);
  ```

### `send-message`
- **Purpose:** Send a direct message in real-time.
- **Payload:** `{ sender, receiver, content }`
- **Callback:** `{ success, message }` or `{ error }`
- **Receive Event:** `receive-message` (with message object)
- **Usage:**
  ```js
  socket.emit("send-message", { sender, receiver, content }, (response) => {
    if (response.success) { /* ... */ }
  });
  ```

### `send-group-message`
- **Purpose:** Send a message to a group in real-time.
- **Payload:** `{ sender, groupId, content }`
- **Callback:** `{ success, message }` or `{ error }`
- **Receive Event:** `receive-group-message` (with message object)
- **Usage:**
  ```js
  socket.emit("send-group-message", { sender, groupId, content }, (response) => {
    if (response.success) { /* ... */ }
  });
  ```

---

## Data Models

### User
- `_id`, `fullName`, `email`, `password (hashed)`, `profilePic`, `phoneNumber`, `friends` (array of User IDs), `blocked` (array of User IDs)

### Message
- `_id`, `sender` (User ID), `receiver` (User ID, optional), `group` (Group ID, optional), `content`, `read`, `createdAt`, `updatedAt`

### Group
- `_id`, `name`, `members` (array of User IDs), `admins` (array of User IDs), `description`, `avatar`, `createdAt`, `updatedAt`

---

## Authentication Details
- **JWT Token:** Sent as an HTTP-only cookie or in the `Authorization: Bearer <token>` header for REST, and as `auth.token` for Socket.IO.
- **Token Expiry:** 7 days by default.
- **Security:** Never share your JWT secret. Always use HTTPS in production.

---

## Error Handling
- All endpoints return appropriate HTTP status codes:
  - `400 Bad Request`: Invalid input or missing fields
  - `401 Unauthorized`: Missing or invalid JWT
  - `403 Forbidden`: Action not allowed (e.g., blocked, not an admin)
  - `404 Not Found`: Resource does not exist
  - `500 Internal Server Error`: Server-side error
- All errors are JSON objects: `{ "message": "..." }`
- Socket.IO events use callback with `{ error: "..." }`