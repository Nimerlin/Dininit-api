db = db.getSiblingDB("dininit_monitoring");

// Create `users` collection with sample data
db.users.insertMany([
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    password: "hashed_password",
    createdAt: new Date()
  },
  {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "0987654321",
    password: "hashed_password",
    createdAt: new Date()
  }
]);

// Create `payment_status` collection with sample data
db.payment_status.insertMany([
  {
    payment_id: "pay_001",
    user_id: "123",
    status: "success",
    amount: 100,
    created_at: new Date(),
    subscribed: "true"
  },
  {
    payment_id: "pay_002",
    user_id: "456",
    status: "failed",
    amount: 50,
    created_at: new Date(),
    subscribed: "false"
  }
]);

// Create `ticket_details` collection with sample data
db.ticket_details.insertMany([
  {
    title: "Server Issue",
    description: "The server is down since morning.",
    category: "IT Support",
    priority: "High",
    ticket_number: "TICKET-001",
    user: "John Doe",
    created_at: new Date()
  },
  {
    title: "Payment Issue",
    description: "Payment failed for transaction ID 12345.",
    category: "Billing",
    priority: "Medium",
    ticket_number: "TICKET-002",
    user: "Jane Doe",
    created_at: new Date()
  }
]);

print("MongoDB initialized with sample data.");
