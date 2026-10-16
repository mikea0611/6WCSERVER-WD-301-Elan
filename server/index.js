const dns = require('node:dns');
dns.setServers(['8.8.8.8']);

require('dotenv').config();
const express=require('express');const path=require('path');const crypto=require('crypto');
const {mongoose,Product,Customer,Order,Inquiry}=require('./db');
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'32kb'}));
const ready=(req,res,next)=>mongoose.connection.readyState===1?next():res.status(503).json({error:'Database not connected. Check MongoDB Atlas and your .env configuration.'});
app.get('/api/health',(req,res)=>res.json({server:'online',database:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.get('/api/products',ready,async(req,res)=>{try{res.json(await Product.find().sort({id:1}).lean())}catch(e){res.status(500).json({error:'Could not retrieve products'})}});
app.get('/api/customers',ready,async(req,res)=>{try{res.json(await Customer.find().select('id name email phone -_id').lean())}catch(e){res.status(500).json({error:'Could not retrieve customers'})}});
app.post('/api/orders',ready,async(req,res)=>{try{
 const {customer,rental,paymentMethod,items}=req.body||{};
 if(!customer||!rental||!Array.isArray(items)||!items.length||items.length>30||!['string'].includes(typeof customer.name)||!/^\S+@\S+\.\S+$/.test(customer.email||'')||!/^09\d{9}$/.test(customer.phone||'')||!rental.startDate||!rental.returnDate||!paymentMethod)return res.status(400).json({error:'Please provide valid customer, rental and payment details.'});
 const start=new Date(rental.startDate+'T00:00:00Z'),end=new Date(rental.returnDate+'T00:00:00Z');if(!Number.isFinite(+start)||!Number.isFinite(+end)||end<start||start<new Date(new Date().toISOString().slice(0,10)+'T00:00:00Z'))return res.status(400).json({error:'Invalid rental dates.'});
 const products=await Product.find({name:{$in:items.map(i=>i.name)}}).lean();let subtotal=0;const verified=[];
 for(const item of items){const product=products.find(p=>p.name===item.name);if(!product||product.availability!=='Available for Rental'||!product.sizes.includes(item.size))return res.status(400).json({error:'A selected dress or size is unavailable.'});subtotal+=product.price;verified.push({name:product.name,size:item.size,price:product.price})}
 const discount=req.body.memberDiscount===true?subtotal*.15:0;const total=Math.round((subtotal-discount)*100)/100;
 const reference='ELAN-'+crypto.randomBytes(5).toString('hex').toUpperCase();await Order.create({reference,customer,rental,paymentMethod,items:verified,total,status:'Rental request received'});res.status(201).json({reference,total,status:'Rental request received'});
 }catch(e){console.error('Order error:',e.message);res.status(500).json({error:'Unable to save rental request.'})}});
app.post('/api/contact',ready,async(req,res)=>{try{const {name,email,subject,message}=req.body||{};if(![name,email,subject,message].every(v=>typeof v==='string'&&v.trim()&&v.length<=3000)||!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({error:'Please enter valid contact details.'});await Inquiry.create({name,email,subject,message});res.status(201).json({success:true,message:'Inquiry saved.'})}catch(e){res.status(500).json({error:'Unable to save inquiry.'})}});
app.use('/vendor/vue',express.static(path.join(__dirname,'../node_modules/vue/dist')));
app.use(['/server/*','/package.json','/package-lock.json','/README-MEVN.md','/products.json','/customers.json'],(req,res)=>res.sendStatus(404));
app.use(express.static(path.join(__dirname,'..'),{dotfiles:'ignore',index:'index.html'}));
app.use((req,res)=>res.status(404).json({error:'Not found'}));
const port=Number(process.env.PORT)||3000;app.listen(port,()=>console.log(`ÉLAN running at http://localhost:${port}`));
if(process.env.MONGODB_URI){mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('MongoDB Atlas connected')).catch(e=>console.error('MongoDB connection failed:',e.message))}else console.warn('MONGODB_URI missing: configure .env and run npm run seed');
