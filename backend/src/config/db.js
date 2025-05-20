const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Sử dụng biến môi trường nếu có, nếu không sử dụng URL trực tiếp
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://sonmac9103:sonmac9103@cluster0.yor2o0q.mongodb.net/SLD?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 