INSERT INTO users (id, email, password_hash, name, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@crm.com', '$2b$10$Ef3EfSGbByGREJJq5nPfhOUoJuTBw9Bxan8sAEJb.PQWIDO8Ctr.G', 'Admin User', 'admin'),
('22222222-2222-2222-2222-222222222222', 'sales@crm.com', '$2b$10$Ef3EfSGbByGREJJq5nPfhOUoJuTBw9Bxan8sAEJb.PQWIDO8Ctr.G', 'Sales Rep', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO leads (id, name, company, email, phone, source, status, deal_value, assigned_to) VALUES
(uuid_generate_v4(), 'John Doe', 'Acme Corp', 'john@acme.com', '123-456-7890', 'Website', 'New', 15000.00, '22222222-2222-2222-2222-222222222222'),
(uuid_generate_v4(), 'Jane Smith', 'Globex', 'jane@globex.com', '098-765-4321', 'Referral', 'Contacted', 25000.00, '22222222-2222-2222-2222-222222222222'),
(uuid_generate_v4(), 'Alice Johnson', 'Soylent Corp', 'alice@soylent.com', '555-123-4567', 'LinkedIn', 'Qualified', 5000.00, '11111111-1111-1111-1111-111111111111'),
(uuid_generate_v4(), 'Bob Brown', 'Initech', 'bob@initech.com', '555-987-6543', 'Cold Email', 'Proposal Sent', 45000.00, '22222222-2222-2222-2222-222222222222'),
(uuid_generate_v4(), 'Charlie Davis', 'Umbrella Corp', 'charlie@umbrella.com', '555-555-5555', 'Event', 'Won', 100000.00, '11111111-1111-1111-1111-111111111111'),
(uuid_generate_v4(), 'Diana Evans', 'Massive Dynamic', 'diana@massive.com', '555-111-2222', 'Website', 'Lost', 12000.00, '22222222-2222-2222-2222-222222222222'),
(uuid_generate_v4(), 'Evan Harris', 'Stark Industries', 'evan@stark.com', '555-333-4444', 'LinkedIn', 'New', 75000.00, '11111111-1111-1111-1111-111111111111'),
(uuid_generate_v4(), 'Fiona Green', 'Wayne Enterprises', 'fiona@wayne.com', '555-666-7777', 'Referral', 'Qualified', 30000.00, '22222222-2222-2222-2222-222222222222'),
(uuid_generate_v4(), 'George Hall', 'Oscorp', 'george@oscorp.com', '555-888-9999', 'Cold Email', 'Contacted', 8000.00, '11111111-1111-1111-1111-111111111111'),
(uuid_generate_v4(), 'Hannah Ivy', 'Cyberdyne', 'hannah@cyberdyne.com', '555-000-1111', 'Website', 'Won', 55000.00, '22222222-2222-2222-2222-222222222222');
