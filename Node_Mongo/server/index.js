var express = require('express');
const { Server } = require('http');
var app = express();
//var server = require('http').Server(app);
//var io = require('socket.io')(server);
//conexion db
var connectDB = require('../DB/conection');
//connectDB();
const MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb+srv://admin_sopes:sopes1@datoscorona.nj92e.mongodb.net/dbsopes?retryWrites=true&w=majority';
//Modelo de datos
const DatosCorona = require('../models/DatosCorona');

var contador = 0;
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader(
   "Access-Control-Allow-Headers",
   "Origin, X-Requested-With, Content-Type, Accept, Authorization, AuthorizationReporter"
      );
   res.setHeader(
   "Access-Control-Allow-Methods",
   "GET, POST, PATCH, PUT, DELETE, OPTIONS"
   );
  next();
  });

app.use(express.static('public'));

app.listen(8000,function(){
    console.log('servidor corriendo en el puerto 8000');
});


MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    client.close();
  })
  .catch(error => console.error(error))



  
//Datos generales
app.get('/datoscorona',function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    db.collection('datosCorona').find().toArray()
    .then(results =>{
        console.log(contador ++);
        client.close();
        return res.status(200).send(results);
    })
  })
  .catch(error => console.error(error))
});

app.get('/borrar',function(req,res){
  MongoClient.connect(connectionString, { useUnifiedTopology: true })
.then(client => {
  const db = client.db('dbsopes')
  const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
  db.collection('datosCorona').drop()
  .then(results =>{
      console.log(contador ++);
      client.close();
      return res.status(200).send(results);
  })
})
.catch(error => console.error(error))
});

//Datos por departamento
app.get('/topDeptos', function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    
    const datos =  db.collection('datosCorona').aggregate([{$group: {_id:"$location",contador: {$sum:1}}},{$sort:{contador:-1}}]).limit(3).toArray()
    .then(datos =>{
      console.log(contador ++);
        client.close();
        return res.status(200).send(datos);
    });   
    //console.log(datos);  
    
  })
  .catch(error => console.error(error))
});

app.get('/datosEstados', function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    
    const datos =  db.collection('datosCorona').aggregate([{$group: {_id:"$infected_type",contador: {$sum:1}}},{$sort:{contador:-1}}]).toArray()
    .then(datos =>{
      console.log(contador ++);
        client.close();
        return res.status(200).send(datos);
    });   
    //console.log(datos);  
    
  })
  .catch(error => console.error(error))
});

app.get('/datosEdad', function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    
    const datos =  db.collection('datosCorona').aggregate([{$group: {_id:"$age",contador: {$sum:1}}},{$sort:{contador:-1}}]).toArray()
    .then(datos =>{
      console.log(contador ++);
        client.close();
        return res.status(200).send(datos);
    });   
    //console.log(datos);  
    
  })
  .catch(error => console.error(error))
});

app.get('/datosDepto', function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    
    const datos =  db.collection('datosCorona').aggregate([{$group: {_id:"$location",contador: {$sum:1}}},{$sort:{contador:-1}}]).toArray()
    .then(datos =>{
      console.log(contador ++);
        client.close();
        return res.status(200).send(datos);
    });   
    //console.log(datos);  
    
  })
  .catch(error => console.error(error))
});

app.get('/datosEstado', function(req,res){
    MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('dbsopes')
    const quotesCollection = db.collection('datoscorona')//cambio para datos de corona
    
    const datos =  db.collection('datosCorona').aggregate([{$group: {_id:"$state",contador: {$sum:1}}},{$sort:{contador:-1}}]).toArray()
    .then(datos =>{
      console.log(contador ++);
        client.close();
        return res.status(200).send(datos);
    });   
    //console.log(datos);  
    
  })
  .catch(error => console.error(error))
});



//prueba de socket
/*io.on('connection',async(req,res)=>{
    console.log('conexion por socket exitosa');
    const datos = await DatosCorona.find();
    if(datos == 0){
        console.log('datos vacios');

    }else{
        console.log('si hay datos');
        console.log(datos);
    }
   
});*/
