-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clothes Measurements Table
CREATE TABLE IF NOT EXISTS clothes_measurements (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    name TEXT NOT NULL,
    length REAL,
    sleeve REAL,
    shoulder REAL,
    armhole REAL,
    chest REAL,
    side REAL,
    skirt REAL,
    trousers REAL,
    leg_opening REAL,
    cuff REAL,
    sleeve_design TEXT,
    bottom REAL,
    pleat REAL,
    pocket_top TEXT,
    pocket_side TEXT,
    trousers_pocket TEXT,
    button TEXT,
    stitching TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Waistcoat Measurements Table
CREATE TABLE IF NOT EXISTS waistcoat_measurements (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    name TEXT NOT NULL,
    length REAL,
    shoulder REAL,
    side REAL,
    waist REAL,
    tureen REAL,
    armhole REAL,
    pleat REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    clothes_measurement_id TEXT,
    waistcoat_measurement_id TEXT,
    order_number TEXT UNIQUE NOT NULL,
    order_date DATETIME NOT NULL,
    delivery_date DATETIME NOT NULL,
    status TEXT NOT NULL,
    advance_payment REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    balance_due REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (clothes_measurement_id) REFERENCES clothes_measurements(id) ON DELETE SET NULL,
    FOREIGN KEY (waistcoat_measurement_id) REFERENCES waistcoat_measurements(id) ON DELETE SET NULL
);

-- Fabrics Table
CREATE TABLE IF NOT EXISTS fabrics (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price_per_unit REAL DEFAULT 0,
    supplier TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trims Table
CREATE TABLE IF NOT EXISTS trims (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    size TEXT,
    price_per_unit REAL DEFAULT 0,
    supplier TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Order Fabrics Junction Table
CREATE TABLE IF NOT EXISTS order_fabrics (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    fabric_id TEXT NOT NULL,
    quantity_used REAL NOT NULL,
    unit_cost REAL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (fabric_id) REFERENCES fabrics(id) ON DELETE CASCADE
);

-- Order Trims Junction Table
CREATE TABLE IF NOT EXISTS order_trims (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    trim_id TEXT NOT NULL,
    quantity_used INTEGER NOT NULL,
    unit_cost REAL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (trim_id) REFERENCES trims(id) ON DELETE CASCADE
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    subtotal REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_clothes_meas_customer ON clothes_measurements(customer_id);
CREATE INDEX IF NOT EXISTS idx_waistcoat_meas_customer ON waistcoat_measurements(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Triggers for automatic updated_at
CREATE TRIGGER IF NOT EXISTS update_customers_timestamp
AFTER UPDATE ON customers
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_clothes_meas_timestamp
AFTER UPDATE ON clothes_measurements
BEGIN
    UPDATE clothes_measurements SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_waistcoat_meas_timestamp
AFTER UPDATE ON waistcoat_measurements
BEGIN
    UPDATE waistcoat_measurements SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_orders_timestamp
AFTER UPDATE ON orders
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_fabrics_timestamp
AFTER UPDATE ON fabrics
BEGIN
    UPDATE fabrics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_trims_timestamp
AFTER UPDATE ON trims
BEGIN
    UPDATE trims SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
