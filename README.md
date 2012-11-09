Survey Generator
==============
This project contains a sample survey application built for Erik Meijer's Functional Programming course at Delft University of Technology.


/survey_viewer
------------
This folder contains a mobile PhoneGap-powered application.

Dependencies:
* Java 6
* Android SDK, version 4
* Eclipse ADT plugin
* Alter the server host name variable in the file `assets/www/js/application.js`, line 19.
* Import the project in Eclipse.
* `Run as Android Application`.

/survey_server
------------
Folder containing a node.js-powered web server, providing the API used by the viewer application.

Dependencies:
* node.js - version >= 0.8
* npm
* node-mysql - version <= 2.0.0
* MySQL server

Usage:
* Install the aforementioned dependencies.
* Import `database.sql` to a database of choice.
* Alter the database config at the bottom of file `server.js` to match your MySQL settings.
* Run `node index.js`

