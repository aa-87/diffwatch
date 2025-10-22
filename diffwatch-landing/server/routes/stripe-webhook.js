import Stripe from 'stripe'
import { upsertSubscriptionByStripe } from '../lib/db.js'
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)
export default async function stripeWebhook(req,res){let event; try{event=stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)}catch(err){return res.status(400).send(`Webhook Error: ${err.message}`)} if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)){await upsertSubscriptionByStripe(event.data.object)} return res.json({received:true})}
