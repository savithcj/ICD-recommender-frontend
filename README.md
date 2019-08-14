The following instruction is generally intended for setting up a local development server. For deploying over AWS see detailed report.

Pre-req: A running back-end server that provides: 
  - REST API for comminucation
  - OATH2 resource owner-based authentication
  - client id for OATH2

Set-up:
1. Set up environment variables:
  - REACT_APP_CLIENT_ID
  - REACT_APP_SERVER_ADDRESS

2. Open terminal, navigate to root directory of this repo, and use the commands below.
Install dependencies using NPM:
```
npm install
```
Run node server:
```
npm start
```
