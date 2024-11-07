Pumpd - Fitness Tracking Application
A web application providing personalized workout plans, progress tracking, and nutrition guidance. This app is developed by Team S.C.A.M.


Project Structure
Frontend: Contains HTML, CSS, and JavaScript files for the user interface.
Backend: Node.js server handling user authentication, database interactions, and API integrations.

You need:
Node.js
PostgreSQL

Setup:
Clone the Repository:
git clone https://github.com/whatreaper/S.C.A.M.git
cd S.C.A.M

Install Dependencies: 
cd backend
npm install

Database Setup:
Make sure PostgreSQL is running.
Create a database named pumpd and set up a user with access
CREATE DATABASE pumpd;
\c pumpd
\i schema.sql
\dt to view List of relations

Copy the env_sample.json file to a new file named .env in the backend folder
Update the .env file with your own credentials

In the backend folder, start the server by running
npm start
This will run the application on http://localhost:3000.

Special Thanks
- [Ollie Jennings](https://github.com/OllieJennings) for the original dataset at [exercises.json](https://github.com/wrkout/exercises.json)
