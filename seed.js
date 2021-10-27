const { Product } = require('./models/product');
const mongoose = require('mongoose');
const config = require('config');


let data = [
    {name: "Keyboard", price: 20, numberInStock: 5},
    {name: "Mouse", price: 40, numberInStock: 6},
    {name: "Watch", price: 20, numberInStock: 3},
    {name: "Headfone", price: 200, numberInStock: 10},
    {name: "USB Flash Drive", price: 50, numberInStock: 15},
    {name: "Notebook Cooler", price: 150, numberInStock: 25},
    {name: "Camera", price: 1500, numberInStock: 5},
    {name: "Printer", price: 2000, numberInStock: 25},
    {name: "Tablet", price: 5000, numberInStock: 5},
    {name: "LED TV", price: 1500, numberInStock: 35},
    {name: "Router", price: 150, numberInStock: 30}
];  

async function seed() {
    await mongoose.connect(config.get('db'));
  
    await Product.deleteMany({});
  
    for (let p of data) {
      const { _id } = await new Product({ 
          name: p.name, 
          price: p.price, 
          numberInStock: p.numberInStock 
        }).save();
    }
  
    mongoose.disconnect();
  
    console.info('Done!');
}
  
seed();

