# express-oauth2

express oauth2 helper

## path

this helper return a router that registers some paths:

-   `/`: The auth url, which will redirect the client to the oauth service to login.
-   `/redirect`: must the same with the redirect url that you set in the oauth service.
-   `/refresh`: request a new token if it's expired.

## usage

example: access `http://localhost:9900/discord` on your browser
the redirect url should be `http://localhost:9900/discord/redirect`

```js
require('dotenv').config()
const fetch = require('node-fetch')

const express = require('express')
const app = express()
const port = 9900

const discord = require('.')({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    scope: process.env.DISCORD_SCOPE,
    url_auth: process.env.DISCORD_URL_AUTH,
    url_token: process.env.DISCORD_URL_TOKEN,
    url_redirect: process.env.DISCORD_URL_REDIRECT,
    hook,
})

app.use('/discord', discord)

app.use((err, req, res, next) => {
    console.error('ERR:', err)
    res.status(err.status || 500).end()
})

app.listen(port, () => {
    console.log(`OAUTH example listening at localhost:${port}/discord`)
})

async function hook(token) {
    const res = await fetch('http://httpbin.org/post', {
        method: 'POST',
        body: JSON.stringify(token),
        headers: {
            'content-type': 'application/json',
        },
    })
    const data = await res.json()
    console.log(res.status)
    console.log(data)
}
```
