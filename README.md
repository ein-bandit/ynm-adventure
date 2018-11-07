Tower Dungeon Community Game
======
**TDCG** or ynm-adventure is a little Client/Server Game developed during the first Get-To-Know-Each-Other GameJam @ HAW Hamburg Games Master. Topic of the Jam was "Yes, No, Maybe".

Clients, respectively the community, decides how the adventure evolves. Currently 2 branches and multiple endings are featured in the story.

After a part of the story is shown on the "Game Screen" (a browser window playing the game) a voting on the clients appears. Commonly mobile browsers are used for clients.
The voting mechanism is handled via Server Sent Events. The Game notifies the server to start a voting, again the server notifies the clients via the kept-alive channel using EventSource API.
When the timeout on the server completes, no more votes are accepted and the game gets informed about the communities decision.

Want to try it? You can find it on Heroku (https://ynm-adventure.herokuapp.com/index)

## Available Routes
* Open the Game on a browser all players can see. You can use the /index page to wait for players to connect or directly access /game for starting immediately [ynm-adventure.herokuapp.com/game](https://ynm-adventure.herokuapp.com/game)
* Players can access [ynm-adventure.herokuapp.com/client](https://ynm-adventure.herokuapp.com/client)

## Clone and Run on your device

### Prerequesites

Node and NPM installed. (Project was tested with Node v5.5.0)

### Instructions 
Clone the repository and execute
```
$ npm install
# installs bower and starts bower install automatically 
```
to install the dependencies. Frontend dependencies get installed with bower after the node_modules are created.

Use
```
$ npm start
```
to start the Express server and navigate to
```
$ http://localhost/index
```