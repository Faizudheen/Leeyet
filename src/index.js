const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const ejs = require('ejs')
const path = require('path')
const bodyParser = require('body-parser');


const app = express();



const conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'products'
})

conn.connect();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const prefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, prefix + file.originalname);
  }
});


const upload = multer({ storage });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("uploads"));

app.get('/', async (req, res) => {
  const sql = 'select * from productlist ';
  const resultPromise = await new Promise((resolve, reject) => {
    conn.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);

      }

    });

  });

  res.render('index', { products: resultPromise })
})


app.get('/products', async (req, res) => {



  res.render('products');
})

app.post('/addproduct', upload.array('productImages'), async (req, res) => {
  const name = req.body.name;
  const price = parseFloat(req.body.price);
  const discount = parseFloat(req.body.discount)
  const shipping = parseFloat(req.body.shipping)

  const tax = 0.18; // Assuming tax rate is 18%
  const mrp = (price * (1 + tax)) - discount + shipping;

  const filenames = req.files.map(file => file.filename);
  const sql = `insert into productlist (name,taxablevalue,discount,shipping,price,url) values ('${name}',${price},${discount},${shipping},${mrp},'${filenames}')`;
  const resultPromise = await new Promise((resolve, reject) => {
    conn.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);

      }
    });
  });

  res.redirect('/');

})

app.post('/getproduct', async (req, res) => {

  const id = req.body.id;

  const sql = `select * from productlist where id= ${id}`;
  const resultPromise = await new Promise((resolve, reject) => {
    conn.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);

      }

    });

  });

  res.status(200).json(JSON.stringify(resultPromise));
})

app.post('/update', upload.array('productImages'), async (req, res) => {
  const id = req.body.productid;

  const name = req.body.name;
  const price = parseFloat(req.body.price);
  const discount = parseFloat(req.body.discount)
  const shipping = parseFloat(req.body.shipping)

  const tax = 0.18; // Assuming tax rate is 18%
  const mrp = (price * (1 + tax)) - discount + shipping;

  const filenames = req.files.map(file => file.filename);
  const sql = `update productlist
                set name = '${name}',
                taxablevalue = ${price},
                discount = ${discount},
                shipping = ${shipping},
                price = ${mrp},
                url = '${filenames}'
                where id = ${id};`;
  const resultPromise = await new Promise((resolve, reject) => {
    conn.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);

      }
    });
  });

  res.redirect('/');

})


app.post('/delete', async (req, res) => {
  const id = req.body.id;


  const sql = `delete from productlist
                where id = ${id};`;
  const resultPromise = await new Promise((resolve, reject) => {
    conn.query(sql, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);

      }
    });
  });

  res.sendStatus(200);

})




app.listen(3000, () => console.log('Running on port 3000'));