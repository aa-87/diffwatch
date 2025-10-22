import { Router } from 'express'
import Stripe from 'stripe'
import { prisma, setStripeCustomerId } from '../lib/db.js'
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY); const r=Router()
r.post('/checkout', async (req,res)=>{const {priceId}=req.body; const userId=req.session?.userId; if(!userId) return res.redirect('/signup.html'); const user=await prisma.user.findUnique({where:{id:userId}}); let customerId=user?.stripeCustomerId; if(!customerId){const customer=await stripe.customers.create({email:user.email,metadata:{userId}}); customerId=customer.id; await setStripeCustomerId(userId,customerId)} const session=await stripe.checkout.sessions.create({mode:'subscription',customer:customerId,line_items:[{price:priceId,quantity:1}],allow_promotion_codes:true,success_url:`${process.env.APP_BASE_URL}/success.html`,cancel_url:`${process.env.APP_BASE_URL}/pricing.html`}); return res.redirect(303, session.url)})
export default r
