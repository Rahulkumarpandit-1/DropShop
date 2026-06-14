// middleware/passport.js — top of file
require("dotenv").config();
console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID); // prints or undefined?
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const clientID = process.env.GOOGLE_CLIENT_ID || "dummy_client_id";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "dummy_client_secret";

if (process.env.GOOGLE_CLIENT_ID) {
  console.log("Registering GoogleStrategy with Client ID:", process.env.GOOGLE_CLIENT_ID);
} else {
  console.warn("GOOGLE_CLIENT_ID not found. Google Auth is disabled.");
}

const backendUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
const callbackURL = `${backendUrl.trim().replace(/\/$/, "")}/api/auth/google/callback`;

passport.use(new GoogleStrategy({
  clientID: clientID,
  clientSecret: clientSecret,
  callbackURL: callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: `google_${profile.id}`,
        googleId: profile.id
      });
      await user.save();
    }
    return done(null, profile);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;