const dns = require('node:dns');
dns.setServers(['8.8.8.8']);

require('dotenv').config();
const path=require('path');
const {mongoose,Product,Customer}=require('./db');
async function main(){if(!process.env.MONGODB_URI)throw Error('Set MONGODB_URI in .env first');await mongoose.connect(process.env.MONGODB_URI);const products=require(path.join(__dirname,'../products.json'));const customers=require(path.join(__dirname,'../customers.json'));for(const product of products)await Product.updateOne({name:product.name},{$set:product},{upsert:true});for(const customer of customers)await Customer.updateOne({id:customer.id},{$set:customer},{upsert:true});console.log(`Seeded ${products.length} products and ${customers.length} sample customers`)}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>mongoose.disconnect());
