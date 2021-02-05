const mongoose = require('mongoose');

const URI = 'mongodb+srv://admin_sopes:sopes1@datoscorona.nj92e.mongodb.net/dbsopes?retryWrites=true&w=majority';

const connectDB = async() =>{
    await mongoose.connect(URI,{
        useUnifiedTopology:true,
        useNewUrlParser:true
    } );
    console.log('base de datos conectada');
};

module.exports = connectDB;

