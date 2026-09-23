# Premium Bengali Home Page Upgrade

## Goal
Transform the existing ঠিকানা home page into a premium, conversion-focused Bengali property marketplace while preserving the current listings, routes, location search, favourites, and orange/green brand.

## What will change

### 1. Search experience
- Replace the three primary location fields with one Bengali smart search box.
- Add live suggestions for areas, projects, and landmarks with distinct icons and keyboard-friendly selection.
- Save recent searches locally and show popular Bengali search chips with staggered entrance motion.
- Add the visual voice-search pulse, budget pills, and an expandable advanced Division → City → Area row.
- Send chosen searches and budget ranges into the existing browse experience; budget clicks also reveal and highlight matching home-page results.

### 2. Hero and trust
- Restyle the hero around the requested forest green, saffron orange, white, Fraunces, and Hind Siliguri/Inter system.
- Preserve the current real-estate imagery and add a restrained depth/parallax treatment rather than replacing the page structure.
- Add the trust strip with one-time Bengali count-up statistics and a compact partner/press row.

### 3. New conversion sections
- Add snap-scroll “আপনার জন্য প্রস্তাবিত” and “সদ্য যোগ হয়েছে” carousels with edge peeking and mouse/touch drag momentum.
- Add trending-area cards with animated sparklines.
- Add area price comparison cards with animated bars.
- Add the compact EMI teaser and floating WhatsApp/Messenger contact control.
- Keep existing category links and property cards, refining their presentation without changing their data behavior.

### 4. Motion system
- Build one shared IntersectionObserver reveal system with early triggering and one-time state.
- Use choreographed eyebrow, curtain-title, underline, staggered-card, counter, sparkline, bar-growth, hero-parallax, and header-compaction motion.
- Keep animation transform/opacity-based where possible and disable motion cleanly for reduced-motion users.

### 5. Responsive and quality pass
- Make the full experience work at mobile, tablet, and desktop widths without overlap.
- Add complete page metadata and Bengali language/font loading.
- Verify smart search, advanced filters, recents, carousels, budget filtering, header behavior, reduced-motion handling, and mobile/desktop rendering in the live preview.

## Technical details
- React state and browser storage for smart/recent search; no new backend is required.
- Existing TanStack routes and listing data remain authoritative.
- Semantic design tokens remain in the global theme; interactive controls continue using the existing design components.
- Lightweight inline SVG sparklines and native pointer events avoid heavy animation/carousel libraries.
