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
