-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,                                   -- شمیره (Phone)
    address TEXT,                                 -- پته (Address)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clothes Measurements Table
CREATE TABLE IF NOT EXISTS clothes_measurements (
    id TEXT PRIMARY KEY,                           -- آئی ڈی
    customer_id TEXT NOT NULL,                     -- د پیرودونکی آئی ڈی
    name TEXT,                            -- نوم
    length REAL,                                   -- قد (Length)
    sleeve REAL,                                   -- استین (Sleeve)
    shoulder REAL,                                 -- شانه (Shoulder)
    armhole REAL,                                  -- یخن (Armhole / Underarm)
    chest REAL,                                    -- سینه (Chest)
    side REAL,                                     -- بغل (Side / Underarm)
    skirt REAL,                                    -- دامن (Skirt / Lower hem)
    trousers REAL,                                 -- تمبان (Trousers / Pants)
    leg_opening REAL,                              -- پاچه (Leg opening)
    cuff REAL,                                     -- پټۍ (Cuff / Band)
    sleeve_design TEXT,                            -- استین ډیزاین (Sleeve design)
    bottom REAL,                                   -- کف (Bottom / Sole)
    neck REAL,                                    -- غاړه (Neck)
    pocket_top TEXT,                               -- روی جیب (Pocket top)
    pocket_side TEXT,                              -- بغل جیب (Pocket side)
    skirt_design TEXT,                             -- دامن ډیزاین (Skirt design / Lower hem)
    trousers_design TEXT,                          -- تمبان ډیزاین (Trousers design / Pants)
    trousers_pocket TEXT,                          -- تمبان جیب (Pants pocket)
    button TEXT,                                   -- تکمه (Button)
    stitching TEXT,                                -- دوخت (Stitching)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- د جوړیدو نیټه
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- د تازه کیدو نیټه
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Waistcoat Measurements Table
CREATE TABLE IF NOT EXISTS waistcoat_measurements (
    id TEXT PRIMARY KEY,                                      -- آئی ډی (ID)
    customer_id TEXT NOT NULL,                               -- د پیرودونکی آئی ډی (Customer ID)
    name TEXT,                                      -- نوم (Name)
    length REAL,                                             -- قد (Length)
    shoulder REAL,                                           -- شانه (Shoulder)
    side REAL,                                               -- بغل (Side)
    waist REAL,                                              -- کمر (Waist)
    tureen REAL,                                             -- تورین (Tureen / Chest)
    armhole REAL,                                            -- یخن (Armhole)
    neck TEXT,                                               -- غاړه (Neck)  <-- fixed (was pleat)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,           -- جوړیدو نیټه (Created at)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,           -- تازه شوې نیټه (Updated at)
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,                                      -- آئی ډی (ID)
    customer_id TEXT NOT NULL,                               -- د پیرودونکی آئی ډی (Customer ID)
    clothes_measurement_id TEXT,                             -- د جامو اندازه اخیستو آئی ډی (Clothes Measurement ID)
    waistcoat_measurement_id TEXT,                           -- د واسکټ اندازه اخیستو آئی ډی (Waistcoat Measurement ID)
    order_number TEXT UNIQUE NOT NULL,                       -- د امر شمېره (Order Number)
    order_date DATETIME,                                     -- د امر نیټه (Order Date)
    delivery_date DATETIME,                                  -- د سپارلو نیټه (Delivery Date)
    status TEXT,                                             -- حالت (Status)
    quantity INTEGER DEFAULT 1,                                -- مقدار (Quantity)
    unit_price REAL DEFAULT 0,                                  -- د واحد قیمت (Unit Price)
    total_cost REAL DEFAULT 0,                               -- ټول لګښت (Total Cost)
    paid REAL DEFAULT 0,                                     -- ورکړل شوي پیسې (Paid)
    unpaid REAL DEFAULT 0,                                   -- نه دي ورکړل شوي (Unpaid)
    notes TEXT,                                              -- یادښتونه (Notes)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,           -- جوړیدو نیټه (Created at)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,           -- تازه شوې نیټه (Updated at)
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
