# Kuha

Kuha is a privacy-first social media prototype I made for photographers and videographers. I styled it like a dark, cinematic studio portfolio grid. I used only HTML, CSS and vanilla JavaScript. There is no backend, database or API.

## Run it
Open `index.html` in a browser. 

## Structure
```
index.html            Landing page
pages/                login, signup, feed, profile, about, privacy
src/css/style.css     All the styling (design tokens are at the top)
src/js/main.js        All the behavior (storage, auth, grid, viewer, profile)
src/js/portfolio.js   My photos and videos (edit this list)
assets/img/           My photos
assets/video/         My videos
```

## Add my photos and videos
1. I copy my photos into `assets/img/` and my videos (mp4) into `assets/video/`.
2. I list them in `src/js/portfolio.js` with a title, type, path and tag. Pinned items show first.
3. I set my name and handle in the `BUILDER` line at the top of `src/js/main.js`.

My portfolio posts show for everyone who opens the project. Visitors can also upload their own photos or videos from the feed. Those stay in that visitor's browser only.

## Features
- **Signup / Login**: accounts are saved in `localStorage` and passwords are hashed.
- **Route guards**: you need to log in to see the feed and profile. If you are already logged in, login and signup send you to the feed.
- **Feed**: a portrait grid with filter tabs, like counts on hover, pinned posts and video badges. You can click a tile to view it, like it or delete it.
- **Upload**: you can post a photo or a video.
- **Profile**: you can edit your bio, hide like counts, download your data and delete your account.
- **About and Privacy**: these pages explain the idea and how data is handled.

## How it works
Each page sets `data-page` and `data-auth` on `<body>`. `main.js` checks the route guard, adds the shared header and footer, and then runs the code for that page. The storage keys are `kuha_users`, `kuha_session` and `kuha_posts`. Uploaded photos and videos go in an IndexedDB store called `kuha_media`. All user text is escaped before it shows on the page, so nobody can inject scripts.

## Limitations
This is a prototype. Browser storage is not real security. Data is not shared between devices or users.

## AI disclosure
I used Claude 20% in html, 50% in css, ug 80% in java scipt to help build this project. I reviewed it and customized it myself.
