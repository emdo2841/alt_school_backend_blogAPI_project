const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema;


// Define schema for User
const userSchema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true
    },
    password:{
      type: String,
      required: true
  },
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    }
  });
  
// The code in the UserScheme.pre() function is called a pre-hook.
// Before the user information is saved in the database, this function will be called,
// you will get the plain text password, hash it, and store it.
userSchema.pre(
  'save',
  async function (next) {
      const user = this;
      const hash = await bcrypt.hash(this.password, 10);

      this.password = hash;
      next();
  }
);

// You will also need to make sure that the user trying to log in has the correct credentials. Add the following new method:
userSchema.methods.isValidPassword = async function(password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
}

 // Create model for User
 const User = mongoose.model('User', userSchema);
 module.exports = User;