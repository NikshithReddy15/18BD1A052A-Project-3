const http = require('http');
const MongoClient = require('mongodb').MongoClient;

http.createServer((req, res) => {
    console.log(req.url);
    if(req.url.includes('/deleteproduct')) {
        console.log('baseUrl');
        const current_url = new URL("http://localhost:9000//"+req.url);
        const search_params = current_url.searchParams;
        var id = search_params.get('id');
        console.log(id);
        MongoClient.connect('mongodb://localhost:27017/inventory_db',{ useUnifiedTopology: true}, (err, database) => {
            if(err) return console.log(err);
            console.log("Conn success");
            db = database.db('inventory_db');
            db.collection('inventory').deleteOne({"ID":id}, (err, res) => {
                if(err) throw err;
                console.log("Deleted Success");
            });
            res.writeHead(302, {location: "http://localhost:3000",});
            res.end();
        });
    }
    if(req.url.includes('/updateproduct')) {
        console.log('baseUrl');
        const current_url = new URL("http://localhost:9000//"+req.url);
        const search_params = current_url.searchParams;
        var data = search_params.getAll('data');
        console.log(data);
        MongoClient.connect('mongodb://localhost:27017/inventory_db',{ useUnifiedTopology: true}, (err, database) => {
            if(err) return console.log(err);
            console.log("Conn success");
            db = database.db('inventory_db');
            db.collection('temporary').find().toArray((err, res) => {
                if(err) throw err;
                if(res.length > 0) {
                    db.collection('temporary').remove({}, (err, res) => {
                        db.collection('temporary').insertOne({"ID":data[0], "Brand":data[1], "Category":data[2], "ProductName":data[3], "Stock":data[4], "OldCostPrice":data[5], "OldSellingPrice":data[6]}, (err, res) => {
                            if(err) throw err;
                            console.log("Added Temporary Storage Success");
                        });
                    });
                }
                else {
                    db.collection('temporary').insertOne({"ID":data[0], "Brand":data[1], "Category":data[2], "ProductName":data[3], "Stock":data[4], "OldCostPrice":data[5], "OldSellingPrice":data[6]}, (err, res) => {
                        if(err) throw err;
                        console.log("Added Temporary Storage Success");
                    });
                }
            })
        });
        res.writeHead(302, {location: "http://localhost:3000/updateFromButton",});
        res.end();
    }
    if(req.url.includes('/cancel')) {
        console.log('baseUrl');
        const current_url = new URL("http://localhost:9000//"+req.url);
        const search_params = current_url.searchParams;
        var data = search_params.get('cid');
        console.log(data);
        MongoClient.connect('mongodb://localhost:27017/inventory_db',{ useUnifiedTopology: true}, (err, database) => {
            if(err) return console.log(err);
            console.log("Conn success");
            db = database.db('inventory_db');
            db.collection('temporary').deleteOne({"ID":data}, (err, res) => {
                if(err) throw err;
                console.log("Temporary Storage Cleanup Success");
            });
            res.writeHead(302, {location: "http://localhost:3000",});
            res.end();
        });
    }
    else {
        res.writeHead(302, {location: "http://localhost:3000",});
        res.end();
    }
}).listen(9000);
