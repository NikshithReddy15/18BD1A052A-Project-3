const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

var db;

MongoClient.connect('mongodb://localhost:27017/inventory_db',{ useUnifiedTopology: true}, (err, database) => {
    if(err) return console.log(err);
    db = database.db('inventory_db');
    app.listen(3000, () => {
        console.log("Listening on port 3000...")
    })
})

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
        db.collection('inventory').find().toArray((err, result) => {
            if(err) throw err;
            res.render('mainpage.ejs', {data: result, success: 'Good'});
        })
});

app.get('/errorpage', (req, res) => {
    res.render('errorpage.ejs');
});

app.get('/salesdetails', (req, res) => { 
    db.collection('sales').find().toArray((err, result) => {
        if(err) throw err;
        res.render('salesdetails.ejs', {data1: result, success: 'Good'});
    })
});

app.get('/updateFromButton', (req, res) => { 
    db.collection('temporary').find().toArray((err, result) => {
        if(err) throw err;
        res.render('updateFromButton.ejs', {data2: result, success: 'Good'});
    })
});

app.get('/updatesales', (req, res) => {
    res.render('updatesales.ejs');
});

app.get('/addproduct', (req, res) => {
    res.render('addproduct.ejs');
});

app.get('/updateproduct', (req, res) => {
    res.render('updateproduct.ejs');
});

app.get('/deleteproduct', (req, res) => {
    res.render('deleteproduct.ejs');
});

app.post('/addproduct', (req, res) => {
    db.collection('inventory').find({"ID": req.body.ID}).toArray((err, result) => {
        if(err) {
            throw err;
        }
        else {
            if(result.length > 0) {
                res.redirect('/errorpage');
            }
            else {
                db.collection('inventory').insertOne(req.body, (error) => {
                    if(error) throw error;
                    res.redirect('/');
                });
            }
        }
    });
});

app.post('/updatesales', (req, res) => {
    db.collection('inventory').find({ID : req.body.ID}).toArray((err, res) => {
        if(err) {
            throw err;
        }
        else {
            db.collection('sales').insertOne({"Date" : new Date(), "ID" : req.body.ID, "Price" : req.body.SellingPrice, "Quantity" : req.body.Quantity, "Sales" : req.body.SellingPrice*req.body.Quantity}, (err, result) => {
                if(err) throw err;
            });
        }
    });
    res.redirect('/salesdetails');
});

app.post('/updateproduct', (req, res) => {
    db.collection('inventory').find({ID : req.body.ID}).toArray((err, res) => {
        if(err) {
            throw err;
        }
        else {
            db.collection('inventory').findOneAndUpdate({"ID" : req.body.ID}, {$set:{"Quantity" : req.body.Stock, "CostPrice" : req.body.CostPrice, "SellingPrice" : req.body.SellingPrice}}, (err, result) => {
                if(err) throw err;
            });
        }
    });
    res.redirect('/');
});

app.post('/updateFromButton', (req, res) => {
    db.collection('temporary').find({}).toArray((err, res) => {
        if(err) {
            throw err;
        }
        else {
            db.collection('inventory').findOneAndUpdate({"ID" : res[0].ID}, {$set:{"Quantity" : req.body.Stock, "CostPrice" : req.body.CostPrice, "SellingPrice" : req.body.SellingPrice}}, (err, result) => {
                if(err) {
                    throw err;
                }
                else {
                    console.log("Update of "+res[0].ID+" Successful");
                    db.collection('temporary').deleteOne({"ID" : res[0].ID}, (err, res) => {
                        if(err) throw err;
                        console.log("Successfully cleaned Temporary");
                    })
                }
            });
        }
    });
    res.redirect('/');
});

app.post('/deleteproduct', (req, res) => {
    db.collection('inventory').deleteOne({"ID":req.body.ID}, (err, res) => {
        if(err) throw err;
    });
    res.redirect('/');
});
