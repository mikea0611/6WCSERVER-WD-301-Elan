const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({ id:Number,name:{type:String,required:true,unique:true},price:Number,image:String,description:String,sizes:[String],rentalDays:Number,category:String,availability:String },{versionKey:false});
const customerSchema = new mongoose.Schema({id:String,name:String,email:String,phone:String},{versionKey:false});
const orderSchema = new mongoose.Schema({reference:{type:String,required:true,unique:true},customer:{type:mongoose.Schema.Types.Mixed,required:true},rental:{startDate:String,returnDate:String},paymentMethod:String,items:[{name:String,size:String,price:Number}],total:Number,status:{type:String,default:'Rental request received'},createdAt:{type:Date,default:Date.now}},{versionKey:false});
const inquirySchema = new mongoose.Schema({name:String,email:String,subject:String,message:String,createdAt:{type:Date,default:Date.now}},{versionKey:false});
module.exports={mongoose,Product:mongoose.model('Product',productSchema),Customer:mongoose.model('Customer',customerSchema),Order:mongoose.model('Order',orderSchema),Inquiry:mongoose.model('Inquiry',inquirySchema)};
