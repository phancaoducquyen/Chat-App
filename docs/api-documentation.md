# API Documentation

## Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Users

- `GET /api/users/search?keyword=`
- `GET /api/users/friends`

## Friends

- `POST /api/friends/request/:receiverId`
- `GET /api/friends/requests`
- `POST /api/friends/accept/:requestId`
- `POST /api/friends/reject/:requestId`

## Conversations

- `GET /api/conversations`
- `POST /api/conversations/private`
- `POST /api/conversations/group`
- `PUT /api/conversations/:id/add-member`
- `PUT /api/conversations/:id/remove-member`
- `DELETE /api/conversations/:id/leave`
- `DELETE /api/conversations/:id`

## Messages

- `GET /api/messages/:conversationId`
- `PUT /api/messages/:messageId/seen`

## Upload

- `POST /api/upload`
