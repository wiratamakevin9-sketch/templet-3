# Dapur Sekar — Restaurant Website

Static one-page website for Dapur Sekar, a Balinese & Indonesian kitchen in Denpasar.

## Features
- Responsive layout (mobile, tablet, desktop)
- Menu category filter, best-seller section, photo gallery lightbox
- Testimonial slider, live "Open now / Closed" status
- Reservation form with validation and WhatsApp confirmation

## Structure
```
.
├── index.html      # Page markup
├── css/style.css   # All styles
└── js/script.js    # All interactivity
```

## Run locally
No build step or dependencies. Open `index.html` in a browser, or serve the folder:
```
npx serve .
```

## Configuration
- Colors: CSS variables in `:root` at the top of `css/style.css`
- WhatsApp number, restaurant name, time zone: top of `js/script.js`
