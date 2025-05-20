/**
 * Script khởi tạo database cho collection tasks
 * 
 * Cách chạy: 
 * node ./src/scripts/initTasks.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();

// Mô hình dữ liệu cho tasks (tương đương với model)
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Tạo model
const Task = mongoose.model('Task', taskSchema, 'tasks');

// Dữ liệu mẫu
const sampleTasks = [
  {
    title: 'Hoàn thành dự án',
    completed: false,
    dueDate: new Date('2023-06-30')
  },
  {
    title: 'Mua quà sinh nhật cho người yêu',
    completed: false,
    dueDate: new Date('2023-07-15')
  },
  {
    title: 'Hẹn hò cuối tuần',
    completed: true,
    dueDate: new Date('2023-05-20')
  },
  {
    title: 'Lên kế hoạch đi du lịch',
    completed: false,
    dueDate: new Date('2023-08-01')
  },
  {
    title: 'Học tiếng Anh',
    completed: false,
    dueDate: new Date('2023-06-15')
  }
];

// Kết nối đến database
async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://sonmac9103:sonmac9103@cluster0.yor2o0q.mongodb.net/SLD?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`Database Name: ${mongoose.connection.name}`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi kết nối database: ${error.message}`);
    process.exit(1);
  }
}

// Khởi tạo dữ liệu
async function initializeData() {
  try {
    // Kiểm tra xem collection đã tồn tại và có dữ liệu chưa
    const existingTasks = await Task.find();
    
    if (existingTasks && existingTasks.length > 0) {
      console.log('Dữ liệu tasks đã tồn tại, không khởi tạo lại.');
      console.log('Số lượng tasks hiện tại:', existingTasks.length);
      
      // Hiển thị 3 task đầu tiên
      console.log('Các task hiện tại:');
      existingTasks.slice(0, 3).forEach((task, index) => {
        console.log(`${index + 1}. ${task.title} - ${task.completed ? 'Hoàn thành' : 'Chưa hoàn thành'} - Hạn: ${task.dueDate.toISOString().split('T')[0]}`);
      });
      
      // Hỏi người dùng có muốn xóa và tạo lại không
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Bạn có muốn xóa dữ liệu hiện tại và tạo mới không? (y/n) ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          await Task.deleteMany({});
          console.log('Đã xóa tất cả dữ liệu tasks.');
          
          await Task.insertMany(sampleTasks);
          console.log('Đã tạo dữ liệu mẫu cho tasks thành công!');
        } else {
          console.log('Giữ nguyên dữ liệu hiện tại.');
        }
        
        readline.close();
        mongoose.disconnect();
      });
      
    } else {
      // Tạo mới nếu chưa có dữ liệu
      await Task.insertMany(sampleTasks);
      console.log('Đã tạo dữ liệu mẫu cho tasks thành công!');
      mongoose.disconnect();
    }
    
  } catch (error) {
    console.error(`Lỗi khởi tạo dữ liệu: ${error.message}`);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Chạy script
(async () => {
  const connected = await connectDB();
  if (connected) {
    await initializeData();
  }
})(); 