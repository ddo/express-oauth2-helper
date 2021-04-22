const express = require('express')

const fetch = require('node-fetch')
const { URLSearchParams } = require('url')

/*
    opt: {
        client_id,
        url_redirect,
        url_auth,
        url_token,

        // optional
        client_secret,
        scope,
        access_type,
    }
*/
module.exports = opt => {
    if (!opt) throw new Error('no option')
    if (!opt.client_id) throw new Error('no client id')

    // TODO: validate by url contructor?
    if (!opt.url_redirect) throw new Error('no redirect url')
    if (!opt.url_auth) throw new Error('no auth url')
    if (!opt.url_token) throw new Error('no token url')

    const app = express.Router()

    app.get('/', (req, res) => {
        let url = `${opt.url_auth}?client_id=${opt.client_id}&redirect_uri=${opt.url_redirect}&response_type=code`
        if (opt.scope) url += '&scope=' + opt.scope

        res.redirect(
            302, // temporary | 301 = permanently
            url
        )
    })

    app.get('/redirect', async (req, res, next) => {
        const code = req.query.code
        if (!code) {
            next({ status: 400, msg: 'no code' })
            return
        }

        try {
            const data = await exchange(opt, code)
            if (opt.hook) {
                opt.hook(opt, data)
            }

            res.send(true)
        } catch (err) {
            next({ status: 500, msg: err })
        }
    })

    app.get('/refresh', async (req, res, next) => {
        const refresh_token = req.query.refresh_token
        if (!refresh_token) {
            next({ status: 400, msg: 'no refresh token' })
            return
        }

        try {
            const data = await refresh(opt, refresh_token)
            if (opt.hook) {
                opt.hook(opt, data)
            }

            res.send(true)
        } catch (err) {
            next({ status: 500, msg: err })
        }
    })

    return app
}

// exchange code to get token
async function exchange(opt, code) {
    const params = new URLSearchParams()
    params.append('client_id', opt.client_id)
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    params.append('redirect_uri', opt.url_redirect)

    if (opt.client_secret) params.append('client_secret', opt.client_secret)
    if (opt.scope) params.append('scope', opt.scope)
    if (opt.access_type) params.append('access_type', opt.access_type)

    const res = await fetch(opt.url_token, {
        method: 'POST',
        body: params,
    })
    const data = await res.json()

    if (res.status !== 200)
        throw new Error(data.error_description || data.error)

    return data
}

// refresh expired token
async function refresh(opt, refresh_token) {
    const params = new URLSearchParams()
    params.append('client_id', opt.client_id)
    params.append('grant_type', 'refresh_token')
    params.append('refresh_token', refresh_token)
    params.append('redirect_uri', opt.url_redirect)

    if (opt.client_secret) params.append('client_secret', opt.client_secret)
    if (opt.scope) params.append('scope', opt.scope)

    const res = await fetch(opt.url_token, {
        method: 'POST',
        body: params,
    })
    const data = await res.json()

    if (res.status !== 200)
        throw new Error(data.error_description || data.error)

    return data
}
