// MongoDB initialization script
db = db.getSiblingDB('express-typescript');

// Create users collection with sample data
db.createCollection('users');

// Insert sample users
db.users.insertMany([
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    age: 28,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Bob Smith",
    email: "bob@example.com", 
    age: 32,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Carol Davis",
    email: "carol@example.com",
    age: 25,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

print("MongoDB initialized successfully!"); 