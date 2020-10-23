require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const stripe = require('stripe')(`${process.env.SECRET_KEY}`);
const uuid = require('uuid/dist/v4');


//middlewares
app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
    res.send('HELLO');
});

app.post("/payment", (req, res) => {
    const { product, token } = req.body;
    console.log("PRODUCT", product);
    console.log("PRICE", product.price);
    const idempotencyKey = uuid();

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: `purchase of ${product.name}`,
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country
                }
            }
        }, {idempotencyKey})
    }).then(result => res.status(200).json(result)
    ).catch(err => console.log(err));
})

//listen
app.listen(8050, () => {
    console.log('Listening at port 8050');
})