# Movie Watchlist

This project is my third assignment for CS4241. It expands my previous Movie Watchlist application into a full-stack web application with user authentication and persistent database storage.

Live Website: [ADD YOUR A3 RENDER LINK HERE]

The goal of the application is to allow users to create their own personal movie watchlist. Users can create an account, log in, add movies, edit movies, delete movies, and rate movies from 1–10. The server automatically creates a recommendation based on the rating.

Each user's movie watchlist is connected to their account, so users only see the movies that they have added.

One of the main challenges I faced was connecting the application to MongoDB and changing my previous server-side data storage to persistent database storage. I also had to change the application so that each movie is associated with the user who created it.

For authentication, I used username and password authentication with `bcrypt` and `express-session`. Passwords are hashed using bcrypt before being stored in MongoDB. I chose this authentication strategy because it worked well with my existing Express server and allowed me to create a simple registration and login system.

For my CSS framework, I used Bootstrap 5. I used Bootstrap components and classes for forms, buttons, tables, cards, and responsive styling. I also kept my own custom CSS to change Bootstrap's default appearance and give the Movie Watchlist its own design. My custom CSS changes the colors, spacing, card appearance, recommendation labels, layout, and responsive behavior.

## Technical Achievements

- **Tech Achievement 1: MongoDB Persistent Storage**  
  I connected my application to MongoDB Atlas using the MongoDB Node.js driver. Movie and user information is stored in MongoDB instead of only being stored in server memory. This allows the data to remain available even when the server is restarted.

- **Tech Achievement 2: User Authentication**  
  I created a registration, login, and logout system using `bcrypt` and `express-session`. User passwords are hashed before being stored in the database, and passwords are not returned when displaying user information.

- **Tech Achievement 3: User-Specific Data**  
  Each movie is associated with the username of the user who created it. When a user logs in, the server only returns movies associated with that user's account. Users cannot view or modify another user's watchlist.

- **Tech Achievement 4: Full CRUD Functionality**  
  Logged-in users can create, read, update, and delete movies from their watchlist. When a movie is edited, the server also recalculates its recommendation based on the new rating.

- **Tech Achievement 5: Client and Server Communication**  
  I used `fetch()` to communicate between the browser and the Express server. Movie data and account actions can be updated without reloading the entire webpage.

- **Tech Achievement 6: Derived Recommendation Field**  
  The server automatically calculates a recommendation based on the user's movie rating:
  - Ratings 8–10 = Must Watch
  - Ratings 6–7 = Worth Watching
  - Ratings 1–5 = Skip

## Design/Evaluation Achievements

- **Design Achievement 1: Bootstrap CSS Framework**  
  I used Bootstrap 5 as the CSS framework for the application. I used Bootstrap classes including `form-control`, `form-select`, `btn`, `btn-primary`, `btn-secondary`, `table`, `table-hover`, `table-responsive`, and `align-middle`.

- **Design Achievement 2: Custom Bootstrap Styling**  
  I combined Bootstrap with my own external CSS stylesheet. I customized the background colors, cards, spacing, buttons, movie recommendation labels, forms, and overall page layout while still using Bootstrap components.

- **Design Achievement 3: Responsive Layout**  
  The application adjusts for smaller screens. The login/register sections and movie application change from horizontal layouts to vertical layouts on smaller devices, and the movie table can scroll horizontally when necessary.

- **Design Achievement 4: Visual Recommendation System**  
  I created different visual styles for the three recommendation categories. "Must Watch," "Worth Watching," and "Skip" each have their own background style so users can quickly understand the recommendation.

## Challenges

One challenge I faced was changing my previous Movie Watchlist from storing data in a JavaScript array to using MongoDB. I had to update the server routes to use MongoDB queries and MongoDB `_id` values.

Another challenge was implementing authentication and making sure each user only had access to their own movies. I solved this by using sessions to identify the logged-in user and including the username when storing and querying movie data.

I also had to make sure environment variables such as my MongoDB connection string and session secret were not uploaded to GitHub. I stored these values in a `.env` file and added `.env` to `.gitignore`.

## AI Use

I used ChatGPT to help explain errors, debug my Node.js and MongoDB implementation, troubleshoot authentication, and help with HTML, CSS, JavaScript, Express, and Bootstrap implementation.