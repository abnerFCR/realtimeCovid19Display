const mongoose =require('mongoose');
const { Schema } = mongoose;

const CoronaSchema= new Schema({
    name:{type: String, required:true},
    location: {type:String, required:true},
    age: {type:Number, required:true},
    infected_type: {type: String, required:true},
    state: {type: String, required:true},
});

module.exports=mongoose.model('Corona', CoronaSchema);