# TournamentApp
The application designed for managing tournaments, teams, and players.
 Tournament Management System

Welcome to the Tournament Management System! This is a web-based application designed to manage tournaments, teams, and players. The system has two types of users: Tournament Admin and Guest.

The Tournament Admin has access to various functions, including adding a new tournament, adding a team to a tournament, selecting a captain for a team, approving a player to join a team, and deleting a tournament. These functions allow the Tournament Admin to control the overall management of the tournaments.

The Guest user has limited access to the system and can browse match results of a given tournament sorted by date, view players with the highest goal scored in all the tournaments, view players who received red cards in each team, and browse all members of a selected team including manager, coach, captain, and players.


Getting Started
Clone the repository or download the source code.
Install the required dependencies by running npm install.
Run the application using npm start.
Access the application in your web browser by visiting http://localhost:3000.
Application Architecture
The Tournament Management System is built using Node.js and Express.js as the server-side framework, and MongoDB as the database. The front-end is built using HTML, CSS, and JavaScript, with the help of the Handlebars templating engine. The authentication is handled using Passport.js.



File Structure
app.js: Main entry point of the application.
views: Contains all the Handlebars templates.
public: Contains all the static files, including CSS, images, and JavaScript files.
Contributing
We welcome contributions from the community. To contribute, please fork this repository and submit a pull request with your changes. Please ensure that your code follows the existing code style and includes appropriate tests.





