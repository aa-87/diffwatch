import { Router } from 'express'
import { issueOttForUser, exchangeOtt } from '../lib/db.js'
const r=Router()
r.post('/issue', async (req,res)=>{const userId=req.session?.userId; if(!userId) return res.status(401).json({error:'unauthorized'}); const token=await issueOttForUser(userId,60); const redirect=`${process.env.APP_DASHBOARD_URL}/auth/consume-ott?token=${encodeURIComponent(token)}`; res.json({token,redirect})})
r.post('/exchange', async (req,res)=>{const auth=req.headers['x-dw-shared-secret']; if(!auth||auth!==process.env.SHARED_APP_SECRET) return res.status(403).json({error:'forbidden'}); const {token}=req.body||{}; if(!token) return res.status(400).json({error:'missing token'}); const user=await exchangeOtt(token); if(!user) return res.status(400).json({error:'invalid or expired token'}); res.json({id:user.id,email:user.email,plan:user.plan,emailVerified:!!user.emailVerifiedAt})})
export default r
