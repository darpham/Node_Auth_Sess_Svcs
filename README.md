# Node_Auth_Sess_Svcs
## Testing Node.js Authentication and Session services

### How to test system:

Setting up the files on your computer
1. Git Clone
2. `npm install`

Setting up the simple database and and Node.js express application
* Within the authTut/db directory `npm run json:server`
* Within the authTut/server directory `npm run dev:server`

Making commands from the "client", we will simply send cURL commands from the `authTut/client` directory
_Every time you hit an endpoint, a new sessionID will be created and stored within `auth/Tut/server/sessions`_


Hitting the home page, with no authentication or sessionID:
`curl http://localhost:3000/`

GET to login page:
`curl http://localhost:3000/login`

POST to login page: (send credentials to be authenticated and creates a new cookie):
* -c, --cookie-jar cookie-file.txt : creates file that will the store the cookie on the "client" side
* -L : tells cURL to follow redirects (in this case it will redirect user to authenticated endpoint /authrequired)
`curl http://localhost:3000/login -c cookie-file.txt -H 'Content-Type: application/json' -d '{"email":"test@test.com", "password":"password"}' -L`

Accessing /authrequired without sending credentials (using session):
* -b, cookie cookie-file.txt : tells cURL where to find the cookie 
`curl -X GET http://localhost:3000/authrequired -b cookie-file.txt -L`
