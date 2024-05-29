const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../model/users');

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
    new JWTstrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
            // jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken() // Use this if you are using Bearer token
        },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (error) {
                done(error);
            }
        }
    )
);

// This middleware saves the information provided by the user to the database,
// and then sends the user information to the next middleware if successful.
// Otherwise, it reports an error.
passport.use(
    'signup',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            firstNameField: 'first_name',
            lastNameField: 'last_name',
            passReqToCallback: true // Pass the request object to the callback function

        },
        async (req, email, password, done) => {
            try {
                const { first_name, last_name } = req.body; // Access first name and last name from req.body
                const user = await User.create({ email, password, first_name, last_name });

                return done(null, user);
            } catch (error) {
                done(error);
            }
        }
    )
);

// This middleware authenticates the user based on the email and password provided.
// If the user is found, it sends the user information to the next middleware.
// Otherwise, it reports an error.
passport.use(
    'login',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });

                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                const validate = await user.isValidPassword(password);

                if (!validate) {
                    return done(null, false, { message: 'Wrong Password' });
                }
                // Generate JWT token
                const token = jwt.sign({ userId: user._id }, '423erw,.fhrhiidu8477u47rhhfw', { expiresIn: '1h' });
                
                return done(null, user, { message: 'Logged in Successfully' });
            } catch (error) {
                return done(error);
            }
        }
    )
);