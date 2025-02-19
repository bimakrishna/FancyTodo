const {
    User
} = require('../models')
const {
    comparePassword
} = require('../helpers/bcrypt')
const {
    signToken
} = require('../helpers/jwt')
const {
    OAuth2Client
} = require('google-auth-library');


class UserController {
    e
    static async register(req, res, next) {
        try {
            const payload = {
                email: req.body.email,
                password: req.body.password
            }
            const user = await User.create(payload)

            res.status(201).json({
                id: user.id,
                email: user.email
            })
        } catch (error) {
            next(error)
        }
    }

    static async login(req, res, next) {
        try {
            const payload = {
                email: req.body.email,
                password: req.body.password
            }
            const user = await User.findOne({
                where: {
                    email: payload.email
                }
            })
            if (!user) {
                res.status(401).json({
                    message: "wrong password/email"
                })
            } else if (!comparePassword(payload.password, user.password)) {
                res.status(401).json({
                    message: "wrong password/email"
                })
            } else {
                const access_token = signToken({
                    id: user.id,
                    email: user.email
                })
                res.status(200).json({
                    access_token
                })
            }
        } catch (error) {
            next(error)
        }
    }

    static loginGoogle(req, res, next) {
        // Verify Token
        // Dapetin Token dari Client
        console.log('masuk login')
        let {
            google_access_token
        } = req.body;
        const client = new OAuth2Client(process.env.CLIENT_ID);
        let email = '';
        console.log(client)
        // Verify Google Token Berdasarkan Client ID
        client.verifyIdToken({
                idToken: google_access_token,
                audience: process.env.CLIENT_ID,
            })
            .then((ticket) => {
                let payload = ticket.getPayload();
                console.log(ticket)
                email = payload.email;
                return User.findOne({
                    where: {
                        email: payload.email
                    }
                });
            })
            .then((user) => {
                console.log(user)
                if (user) {
                    return user;
                } else {
                    var userObj = {
                        email,
                        password: 'random'
                    }
                    return User.create(userObj);
                }
            })
            .then((dataUser) => {
                let access_token = signToken({
                    id: dataUser.id,
                    email: dataUser.email
                });
                return res.status(200).json({
                    access_token
                });
            })
            .catch((err) => {
                next(err);
            });
    }
}

module.exports = UserController