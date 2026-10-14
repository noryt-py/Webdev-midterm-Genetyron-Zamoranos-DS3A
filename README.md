# Kuha

A privacy-first social media prototype for photographers and videographers. Built with HTML, CSS and vanilla JavaScript only. No backend, database or API.

## Run it
Open `index.html` in a browser (or use VS Code Live Server). No install or build step.

## Structure
```
index.html          Landing page
pages/              login, signup, feed, profile, about, privacy
src/css/style.css   All styling (design tokens at the top)
src/js/main.js      All behavior (storage, auth, feed, profile)
assets/img/         Images (none needed yet)
```

## Features
- **Signup / Login**: accounts saved in `localStorage`; passwords stored as SHA-256 hashes, never plain text.
- **Route guards**: feed and profile redirect to login if logged out; login and signup redirect to the feed if logged in.
- **Feed**: post a caption with a type and frame color, filter by type, like and delete your own posts.
- **Profile**: edit bio, hide like counts, download your data, delete your account.
- **About and Privacy** pages explain the concept and data handling.

## How it works
Each page sets `data-page` and `data-auth` on `<body>`. `main.js` reads them, applies the route guard, injects the shared header and footer, and runs that page's controller. Storage keys: `kuha_users`, `kuha_session`, `kuha_posts`. User text is escaped before display to prevent script injection.

## Limitations
This is a prototype. Browser storage is not real security, and data is not shared between devices or users.

## Customize
Set your name and section in the `BUILDER` line at the top of `src/js/main.js`.

## AI disclosure
This project was generated with help from Claude (Anthropic) and then reviewed and customized by the student.
