# HomeBond Bangladesh

Build a full-stack real estate web app for Bangladesh called "[YourBrandName]" 

— a platform where people can post, browse, and buy/sell/rent houses, flats, 

hotels, and land across all cities of Bangladesh.

CORE CONCEPT:

A location-first property marketplace. Users select their City → Zone/Area 

(especially detailed for Dhaka) to browse or post listings.

LOCATION SYSTEM (very important):

- Step 1: Select Division (Dhaka, Chattogram, Rajshahi, Khulna, Barishal, 

  Sylhet, Rangpur, Mymensingh)

- Step 2: Select City/District (e.g. Dhaka, Bogura, Chattogram, Khulna, etc.)

- Step 3: If Dhaka is selected, show a detailed Area dropdown:

  Uttara, Mirpur, Mohammadpur, Dhanmondi, Gulshan, Banani, Baridhara, 

  Bashundhara, Badda, Rampura, Khilgaon, Jatrabari, Motijheel, Old Dhaka 

  (Lalbagh, Chawkbazar, Sutrapur), Mohakhali, Tejgaon, Farmgate, Shyamoli, 

  Adabor, Kafrul, Cantonment, Uttarkhan, Dakshinkhan, Turag, Savar, Keraniganj

- For other cities (like Bogura), show a similar city-specific area dropdown 

  (Bogura Sadar, Shibganj, Sherpur, Gabtali, etc.) — make this data structure 

  expandable so more cities/areas can be added later.

- Use cascading select dropdowns (Division → City → Area) with search-as-you-type.

USER ROLES:

- Buyer/Renter (browse, save favorites, message sellers)

- Seller/Owner/Agent (post listings, manage posts, chat with buyers)

- Admin (approve/reject listings, manage users, view reports)

CORE FEATURES:

1. Authentication — signup/login (email + phone/OTP option), Google login

2. User Profile — photo, name, phone, location, "Verified" badge, 

   list of their posted properties, saved/favorite listings

3. Property Posts (listings) — each post includes:

   - Type: House / Flat / Hotel / Land / Commercial Space

   - Purpose: For Sale / For Rent

   - Title, description, price (negotiable toggle)

   - Division/City/Area (from location system above)

   - Photos (multi-image gallery upload)

   - Details: bedrooms, bathrooms, size (sqft/decimal/katha), floor, 

     facing direction, parking, furnished status

   - Amenities checklist (lift, generator, gas, security, rooftop, etc.)

   - Contact button + "Message Seller" chat button

4. Search & Filters — by location, price range, property type, 

   bedrooms, purpose (sale/rent)

5. Conversation/Chat — real-time 1:1 messaging between buyer and seller 

   per listing, with chat inbox list

6. Favorites/Saved listings

7. Post management dashboard for sellers (edit, mark as sold/rented, 

   boost/feature a post)

8. Reviews/ratings for sellers or agents

9. Map view (pin properties on a map by area)

10. Bangla + English language toggle (bilingual UI, like your other projects)

11. Notifications (new message, listing approved, price drop alerts)

DESIGN:

Clean, trustworthy real-estate feel — soft neutral background, one strong 

accent color (e.g. deep green or terracotta), card-based property grid 

with image, price, location tag, and a "For Sale/For Rent" ribbon. 

Mobile-first responsive layout.

TECH STACK:

React + Vite + Tailwind CSS (frontend), Node.js/Express + MongoDB (backend), 

JWT auth, Socket.io for real-time chat, Cloudinary or similar for image hosting.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c0ccf38c-f4c4-44c1-b79f-44fce819d533).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
