# Database Design

## User

- name
- email
- password
- avatar
- friends
- isOnline
- lastSeen

## FriendRequest

- sender
- receiver
- status

## Conversation

- type: private | group
- members
- groupName
- groupAvatar
- createdBy

## Message

- conversation
- sender
- text
- fileUrl
- fileName
- fileType
- seenBy
