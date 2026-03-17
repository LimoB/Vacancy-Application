# Job Seeker Application

## Overview

The Job Seeker Application is a web platform designed to connect job seekers with potential employers. Built with Flask and SQLAlchemy on the backend and React on the frontend, this application provides a seamless user experience for browsing and managing job listings.

## Features

- **User Registration**: Users can create an account with a unique username and a valid Gmail address.
- **Email Validation**: The application enforces email validation to ensure all users have a valid Gmail account.
- **Job Listings**: Users can view a list of jobs, each containing detailed information such as:
  - Company Name
  - Job Title
  - Job Description
  - Salary Range
- **Random Data Generation**: The application includes functionality to populate the database with sample job listings using the Faker library, which helps during development and testing.
- **Responsive Client Side**: The frontend is built using React, providing a dynamic and responsive user interface.

## Technologies Used

- **Backend**:
  - **Flask**: A lightweight web framework for Python that facilitates rapid development of web applications.
  - **SQLAlchemy**: An ORM that allows developers to interact with databases using Python objects instead of SQL queries.
  - **Flask-SQLAlchemy**: An extension for Flask that simplifies database interactions with SQLAlchemy.
  - **Faker**: A library that generates fake data, useful for populating the database with test data.
  
- **Frontend**:
  - **React**: A JavaScript library for building user interfaces, providing a smooth and interactive experience for users.

- **Python**: The programming language used for developing the backend of the application.

## Installation

Follow these steps to set up the application on your local machine:

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/job_seeker.git
   cd job_seeker
