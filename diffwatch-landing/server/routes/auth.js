import { Router } from 'express'
import passport from 'passport'
import bcrypt from 'bcryptjs'
import { createUserIfNotExists, getUserByEmail, createVerifyToken, verifyEmailToken, linkOAuthIdentity, setSessionUserId } from '../lib/db.js'
import { sendVerifyEmail } from '../lib/mailer.js'
import { ensureTurnstile } from '../lib/csrf.js'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitLabStrategy } from 'passport-gitlab2'
const r=Router()
passport.serializeUser((user,done)=>done(null,user.id))
passport.deserializeUser((id,done)=>done(null,{id}))
passport.use(new GitHubStrategy({clientID:process.env.GITHUB_CLIENT_ID,clientSecret:process.env.GITHUB_CLIENT_SECRET,callbackURL:`${process.env.APP_BASE_URL}/auth/github/callback`,scope:['read:user','user:email']},async (at,rt,profile,done)=>{try{const email=profile.emails?.[0]?.value||`gh_${profile.id}@users.noreply.github.com`; const user=await createUserIfNotExists(email); await linkOAuthIdentity(user.id,'github',profile.id,at,rt); done(null,{id:user.id})}catch(e){done(e)}}))
passport.use(new GoogleStrategy({clientID:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET,callbackURL:`${process.env.APP_BASE_URL}/auth/google/callback`},async (at,rt,profile,done)=>{try{const email=profile.emails?.[0]?.value; const user=await createUserIfNotExists(email); await linkOAuthIdentity(user.id,'google',profile.id,at,rt); done(null,{id:user.id})}catch(e){done(e)}}))
passport.use(new GitLabStrategy({clientID:process.env.GITLAB_CLIENT_ID,clientSecret:process.env.GITLAB_CLIENT_SECRET,callbackURL:`${process.env.APP_BASE_URL}/auth/gitlab/callback`},async (at,rt,profile,done)=>{try{const email=profile.emails?.[0]?.value||profile._json?.email; const user=await createUserIfNotExists(email); await linkOAuthIdentity(user.id,'gitlab',profile.id,at,rt); done(null,{id:user.id})}catch(e){done(e)}}))
r.get('/github', passport.authenticate('github'))
r.get('/github/callback', passport.authenticate('github',{failureRedirect:'/signup.html?err=oauth'}), async (req,res)=>{await setSessionUserId(req,req.user.id); res.redirect('/success.html')})
r.get('/google', passport.authenticate('google',{scope:['profile','email']}))
r.get('/google/callback', passport.authenticate('google',{failureRedirect:'/signup.html?err=oauth'}), async (req,res)=>{await setSessionUserId(req,req.user.id); res.redirect('/success.html')})
r.get('/gitlab', passport.authenticate('gitlab',{scope:['read_user']}))
r.get('/gitlab/callback', passport.authenticate('gitlab',{failureRedirect:'/signup.html?err=oauth'}), async (req,res)=>{await setSessionUserId(req,req.user.id); res.redirect('/success.html')})
r.post('/signup', ensureTurnstile, async (req,res)=>{const {email,password}=req.body; if(!email||!password||password.length<8) return res.redirect('/signup.html?err=weak'); const existing=await getUserByEmail(email); if(existing&&existing.passwordHash) return res.redirect('/signup.html?err=exists'); const passwordHash=await bcrypt.hash(password,10); const user=await createUserIfNotExists(email,passwordHash); const token=await createVerifyToken(user.id); await sendVerifyEmail(email,token); res.redirect('/verify.html')})
r.get('/verify-email', async (req,res)=>{const ok=await verifyEmailToken(req.query.token); res.redirect(ok?'/success.html':'/signup.html?err=verify')})
export default r
