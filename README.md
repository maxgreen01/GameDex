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
- Responsive UI built with Chakra UI

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

- Firebase Auth
- Docker
- Redis
- RAWG API

---

# Running the Project

This project is intended to be run using Docker. If you don't have Docker installed already, you can install it on Mac, Windows, or Linux by downloading Docker Desktop by following the instructions on the [official Docker website](https://docs.docker.com/get-docker/).

## Start the Application

```bash
docker compose up --build
```

This command runs all necessary services for the frontend and backend in separate Docker containers. The first time you run this command, it may take a few minutes to build the Docker images and start the containers.

Once you see a message like `Server running on port 3000`, everything should be set up. The frontend will be available at:

```txt
http://localhost:5173
```

---

In case you encounter an error like:

```txt
`npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
```

try removing `package-lock.json` and `node-modules`, then running `npm i`, then starting the application again.

## Closing the Application

```bash
docker compose down
```

Alternatively, you can stop the application by pressing `Ctrl + C` in the terminal where the application is running.

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

Profiles support public and private modes. Private profiles restrict reviews and collections to being viewed by friends only.

# Repository

<https://github.com/maxgreen01/GameDex>
