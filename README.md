# GameDex

GameDex is a social game discovery platform where users can review games, build collections, connect with friends, and discover new games through recommendations and search.

---

# Features

- User authentication
- Game reviews and ratings
- Custom game collections
- Friend request system
- Public and private profiles
- User search with Elasticsearch
- RAWG API game integration
- Personalized recommendations
- Responsive UI with Chakra UI

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Chakra UI

## Backend
- Node.js
- Express
- Firebase
- Elasticsearch

## Other
- Docker
- Redis
- RAWG API

---

# Running the Project

This project is intended to be run using Docker.

## Start the application

```bash
docker compose up --watch
```

The frontend will be available at:

```txt
http://localhost:5173
```

---

# Core Functionality

## Home Page
The home page contains multiple game discovery carousels including popular games, newly released games, and personalized recommended games.

## Game Search
Users can search for games and view detailed information pulled from the RAWG API.

## Reviews
Users can create, edit, and delete reviews for games.

## Collections
Users can create custom collections and organize games into them.

## Friends
Users can send friend requests, accept requests, and manage their friends list.

## Privacy
Profiles support public and private modes. Private profiles restrict reviews and collections to friends only.


# Repository
https://github.com/maxgreen01/GameDex
