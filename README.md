# Dog Park Capacity Manager
A simple webapp to make sure there are less than 10 people at the park when it reopens
with the current restrictions.

## Backend
The backend is an express app which offers routes to get the current reservations
and make new reservations.  Data is stored as files on disk.

## Frontend
The front end is a small angular app just will interact with the backend.
This is stored in the webapp directory

The compiled assets for this should be put in the public directory to be served by the backend.