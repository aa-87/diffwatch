import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import path from 'node:path'
import passport from 'passport'

import authRoutes from './routes/auth.js'
import stripeRoutes from './routes/stripe.js'
import stripeWebhook from './routes/stripe-webhook.js'
import ottRoutes from './routes/ott.js'

const app=express(); const PORT=process.env.PORT||3000;
app.use(helmet({contentSecurityPolicy:false,frameguard:{action:'deny'},referrerPolicy:{policy:'no-referrer'},hsts:{maxAge:31536000,includeSubDomains:true,preload:true}}))
app.use(cookieParser())
app.use(cookieSession({name:'dw.sid',secret:process.env.SESSION_SECRET,sameSite:'lax',httpOnly:true,secure:true,maxAge:7*24*60*60*1000}))
app.use(passport.initialize())
app.use(passport.session())
app.use(rateLimit({windowMs:15*60*1000,max:300}))
app.post('/billing/webhook', stripeWebhook)
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static(path.join(process.cwd(),'public')))
app.use('/auth', authRoutes)
app.use('/billing', stripeRoutes)
app.use('/api/ott', ottRoutes)
app.use((req,res)=>res.status(404).send('Not Found'))
app.listen(PORT,()=>console.log('Landing/Signup on :'+PORT))
