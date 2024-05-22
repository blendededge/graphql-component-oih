# graphql-component-oih

## Configuration Options

This project uses a `Config` object for configuration. Here are the properties of that object:

- `query`: A string representing the query to be executed.
- `headers`: An array of `Headers` objects for the request.
- `variables`: An optional string for any variables required for the query.
- `url`: The URL where the request will be sent.
- `auth`: An optional `Auth` object for authentication.
- `username`: An optional string for the username, if required for authentication.
- `passphrase`: An optional string for the passphrase, if required for authentication.
- `key`: An optional string for the key, if required for authentication.
- `headerName`: An optional string for the header name, if required for authentication.
- `accessToken`: An optional string for the access token, if required for authentication.
- `secretAuthTransform`: An optional string for the secret auth transform, if required for authentication.
- `enableRebound`: An optional boolean to enable or disable rebound.
- `httpReboundErrorCodes`: An optional array of numbers representing HTTP error codes that should trigger a rebound.
- `dontThrowErrorFlg`: An optional boolean to enable or disable throwing an error or sending to the next step

Please replace the placeholders with the actual information about your project.