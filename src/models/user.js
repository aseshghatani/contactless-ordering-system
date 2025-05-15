const mongoose=require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    password:{
        required:true,
        type:String,
        minlength:6,
    }
});
userSchema.pre("save",async function(next) {
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    }
    next();
});
const user=mongoose.model("User",userSchema);
module.exports=user;