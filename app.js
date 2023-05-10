
const express = require('express');
const bodyPaser = require('body-parser');
const bcrypt = require("bcrypt");
const exphbs = require('express-handlebars');
const {Sequelize, QueryTypes, EmptyResultError} = require("sequelize");


const app = express();
app.use(express.json())
// body parser
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main'}));
app.set('view engine','handlebars');
app.use(bodyPaser.urlencoded({ extended : false}))
// set static folder
app.use(express.static("public"));
app.use("/uploads",express.static("uploads"));


app.get('/', (req, res)=> res.render('index',{ layout:'landing'}));
// linking to database via sequelize
const sequelize = new Sequelize('campus-taxi', 'root', '', {
    dialect: "mysql",
  });
  // test the connection
sequelize.authenticate().then(() => {
    console.log(' connection to database is successful');
  }).catch((error) => console.log(error, ' sorry an eror'));

  
// admin  login able
const tbl_admin = sequelize.define('tbl_admin', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
  },{tablename:"tbl_admin"});
  tbl_admin.sync();


// designing our tables
const tbl_users = sequelize.define('tbl_users',{
  username:Sequelize.STRING,
  email:Sequelize.STRING,
  phone:Sequelize.STRING,
  location:Sequelize.STRING,
  role:Sequelize.STRING,
  amount:Sequelize.STRING,
  password:Sequelize.STRING
},{tableName:"tbl_users"}
);
// executing the command to create table
tbl_users.sync();



//----------------------------------------//




app.get('/admin_login',(req,res) => {
  res.render("admin_login");
})


app.post('/admin_login',async(req,res) => {
  try{
    const {username,password} = req.body;
    const CheckUser = await tbl_admin.findOne({where:{username:username,password:password}});;
    if(CheckUser){
      res.redirect("dashboard");
    }
    else{
      res.render("admin_login",{adminlogin_error:" Incorrect Login Credentials "});
    }
  }catch(err){
   console.log(err); 
  }
})


app.get('/dashboard',async(req,res) => {
  try{
    const getall = await tbl_users.findAll();
    if(getall){
     res.render('dashboard',{getall});
    }
  }catch(err){
   console.log({message:err});
  }
  res.render("dashboard");
})


// API route for users to register on the app
app.post('/create_user',async (req,res) => {
  const {username,email,phone,location,role,amount} = req.body;
   //const gensalt = await bcrypt.genSalt(10);
  
  const password = await bcrypt.hash(req.body.password,10);
   const UserExist = await tbl_users.findOne({where:{email:email}});
   if(UserExist){
     return res.status(302).json({message:" that user already exist"});
    }else{
       try{
         const createusers =  tbl_users.build({
         username,
         email,
         phone,
         location:"crutech campus", 
         role,
         amount,
         password
       });
       createusers.save();
       return res.status(201).json({message:username+ " your account is created successfully, you can Login "});
       }catch(err){
         console.log({message:err}); 
       }

    }

});

// API login API for all users 
app.post('/loginuser',async(req,res) =>{
      try {
        const { email, password } = req.body;
        const CheckUser = await tbl_users.findOne({where:{email }});
        if(CheckUser && (await bcrypt.compare(password, CheckUser.password))){ 
          return res.status(200).json({message:" Login was successfull"});
        }else{
          return res.status(402).json({message:" User Not Found "});
        }

    } catch (err) {
      console.log({ message: err });

    }

});

// API 
app.get('/find_driver',async(req,res) => {
  try{
    const {location} = req.body;
    const FindDriver =  await tbl_users.findOne({where:{location:location}})
       if(FindDriver){
           return res.status(200).json(
             {
               "Drivers Name ":FindDriver.username,
               "Drivers Number":FindDriver.phone,
               'Drivers Email':FindDriver.email,
               'Drivers Location':FindDriver.location,
               'Amount':FindDriver.amount

             });
       }else{
         // console.log(" location not found ");
         return res.status(404).json({message:"location  not found "});
       }
   }catch(err){
     console.log(err);
   }
})





const PORT = process.env.PORT || 4700;
app.listen(PORT, console.log(`app running at port ${PORT}`));