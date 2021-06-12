## Setting up local development server

1. Set up environment variables in dev_env_vars.sh, it contains default values that will work with default backend configurations:

- REACT_APP_CLIENT_ID
- REACT_APP_SERVER_ADDRESS

2. Install dependencies

```
npm install
```

3. Load environment variables:

```
source ./docs/dev_env_vars.sh
```

4. Start server:

```
npm start
```
