import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// PostgreSQL Pool Connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rukhi',
  ssl: process.env.DATABASE_URL?.includes('render') || process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('pooler')
    ? { rejectUnauthorized: false }
    : false,
});

let dbConnected = false;

async function initDB() {
  try {
    const client = await pool.connect();
    console.log('[DB] Connected to PostgreSQL Database');
    dbConnected = true;

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        password_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        sub_category VARCHAR(100),
        price NUMERIC(10,2) NOT NULL,
        original_price NUMERIC(10,2),
        rating NUMERIC(3,2) DEFAULT 4.5,
        reviews_count INT DEFAULT 12,
        image_url TEXT NOT NULL,
        gallery_images JSONB,
        description TEXT,
        features JSONB,
        stock_status VARCHAR(50) DEFAULT 'in_stock',
        stock INT DEFAULT 20,
        tag VARCHAR(100),
        is_bestseller BOOLEAN DEFAULT false,
        is_trending BOOLEAN DEFAULT false,
        is_new BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        guest_email VARCHAR(255),
        shipping_name VARCHAR(255) NOT NULL,
        shipping_phone VARCHAR(50) NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_city VARCHAR(100) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
        subtotal NUMERIC(10,2) NOT NULL,
        delivery_fee NUMERIC(10,2) NOT NULL,
        total_price NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Processing',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        image_url TEXT
      );
    `);

    // Seed default products if empty
    const productCountRes = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCountRes.rows[0].count, 10) === 0) {
      console.log('[DB] Seeding initial products into database...');
      await client.query(`
        INSERT INTO products (name, category, sub_category, price, original_price, rating, reviews_count, image_url, description, is_bestseller, stock_status, tag, stock)
        VALUES 
        ('Ergonomic Breathable Mesh Executive Office Chair', 'home', 'Organizers', 6850, 8500, 4.8, 34, 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&q=80&w=600', 'High-density lumbar support ergonomic chair.', true, 'in_stock', 'Home Office', 25),
        ('Noise-Cancelling Wireless Over-Ear Headphones PRO', 'electronics', 'Headphones', 4200, 5500, 4.9, 88, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', 'Active Noise Cancellation Bluetooth headset with deep bass.', false, 'in_stock', 'Top Electronics', 18),
        ('Traditional Jamdani Weave Cotton Saree - Midnight Blue', 'fashion', 'Sarees', 3450, 4200, 4.7, 52, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600', 'Handcrafted Jamdani weave saree made with fine cotton.', true, 'in_stock', 'Heritage Fashion', 12),
        ('Premuim Slim Fit Kabli Panjabi Set - Charcoal', 'fashion', 'Panjabi & Kurta', 2890, 3500, 4.8, 41, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600', 'Modern slim-fit Panjabi set with matching pajamas.', false, 'in_stock', 'Eid Collection', 30),
        ('Stainless Steel 7-Piece Non-Stick Cookware Set', 'home', 'Cookware', 5200, 6500, 4.6, 29, 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600', 'Heavy-duty induction compatible cooking set.', true, 'in_stock', 'Kitchen Must-Have', 15),
        ('Pure Sundarban Raw Honey (Organic - 500g)', 'groceries', 'Honey', 850, 1050, 5.0, 112, 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=600', '100% natural wild honey from Sundarban mangrove forests.', false, 'in_stock', 'Organic Harvest', 50),
        ('Smart AMOLED Display Fitness Watch with SpO2', 'electronics', 'Smartwatches', 2990, 3800, 4.5, 63, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', '1.78 inch HD AMOLED smartwatch with heart rate monitoring.', true, 'in_stock', 'Best Seller', 22),
        ('Natural Cold Pressed Kani Mustard Oil (1 Liter)', 'groceries', 'Mustard Oil', 360, 420, 4.9, 74, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600', 'Traditionally extracted cold pressed mustard oil.', false, 'in_stock', 'Grocery Essential', 100);
      `);
    }

    client.release();
  } catch (err) {
    console.warn('[DB] Could not connect to PostgreSQL database:', (err as Error).message);
    dbConnected = false;
  }
}

// API Routes

// Health Check
app.get('/api/db-health', async (_req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ connected: false, message: 'Database connection unavailable' });
  }
  try {
    const dbRes = await pool.query('SELECT version()');
    return res.json({ connected: true, version: dbRes.rows[0].version });
  } catch (err) {
    return res.status(500).json({ connected: false, error: (err as Error).message });
  }
});

// Get Products
app.get('/api/products', async (req, res) => {
  const { category, q } = req.query;

  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable. Please check DATABASE_URL configuration.' });
  }

  try {
    let queryStr = 'SELECT * FROM products';
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (category && category !== 'all') {
      queryParams.push(category);
      conditions.push(`category = $${queryParams.length}`);
    }

    if (q) {
      queryParams.push(`%${q}%`);
      conditions.push(`(name ILIKE $${queryParams.length} OR description ILIKE $${queryParams.length})`);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY id ASC';

    const result = await pool.query(queryStr, queryParams);
    const mapped = result.rows.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      subCategory: p.sub_category,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      rating: Number(p.rating),
      reviewsCount: p.reviews_count,
      image: p.image_url,
      image_url: p.image_url,
      description: p.description,
      isBestseller: p.is_bestseller,
      isTrending: p.is_trending,
      isNew: p.is_new,
      stockStatus: p.stock_status,
      tag: p.tag,
      stock: p.stock,
    }));
    return res.json(mapped);
  } catch (err: any) {
    console.error('[Get Products Error]:', err);
    return res.status(500).json({ message: `Database error fetching products: ${err.message}` });
  }
});

// Create Order
app.post('/api/orders', async (req, res) => {
  const {
    user_id,
    guest_email,
    shipping_name,
    shipping_phone,
    shipping_address,
    shipping_city,
    items,
    subtotal,
    delivery_fee,
  } = req.body;

  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable. Please check DATABASE_URL configuration.' });
  }

  const orderNum = `RK-BD-${Math.floor(100000 + Math.random() * 900000)}`;
  const totalPrice = Number(subtotal) + Number(delivery_fee);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query(
      `INSERT INTO orders 
      (order_number, user_id, guest_email, shipping_name, shipping_phone, shipping_address, shipping_city, payment_method, subtotal, delivery_fee, total_price, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Cash on Delivery', $8, $9, $10, 'Processing')
      RETURNING *`,
      [orderNum, user_id || null, guest_email, shipping_name, shipping_phone, shipping_address, shipping_city, subtotal, delivery_fee, totalPrice]
    );

    const createdOrder = orderRes.rows[0];

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, image_url)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [createdOrder.id, item.product_id, item.product_name, item.quantity, item.price, item.image_url]
        );
      }
    }

    await client.query('COMMIT');
    client.release();

    return res.json({
      success: true,
      order: {
        id: createdOrder.id,
        order_number: createdOrder.order_number,
        shipping_name: createdOrder.shipping_name,
        shipping_phone: createdOrder.shipping_phone,
        shipping_address: createdOrder.shipping_address,
        shipping_city: createdOrder.shipping_city,
        total_price: Number(createdOrder.total_price),
        payment_method: 'Cash on Delivery',
        status: 'Processing',
        created_at: createdOrder.created_at,
      },
    });
  } catch (e: any) {
    await client.query('ROLLBACK');
    client.release();
    console.error('[Create Order Error]:', e);
    return res.status(500).json({ message: `Database order creation failed: ${e.message}` });
  }
});

// Get User Orders
app.get('/api/orders', async (req, res) => {
  const { user_id, email } = req.query;

  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable. Please check DATABASE_URL configuration.' });
  }

  try {
    const orderRes = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 OR guest_email = $2 ORDER BY created_at DESC`,
      [user_id || null, email || null]
    );

    const orders = [];
    for (const row of orderRes.rows) {
      const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [row.id]);
      orders.push({
        id: row.id,
        order_number: row.order_number,
        shipping_name: row.shipping_name,
        shipping_phone: row.shipping_phone,
        shipping_address: row.shipping_address,
        shipping_city: row.shipping_city,
        payment_method: row.payment_method,
        subtotal: Number(row.subtotal),
        delivery_fee: Number(row.delivery_fee),
        total_price: Number(row.total_price),
        status: row.status,
        created_at: row.created_at,
        items: itemsRes.rows.map((it) => ({
          id: it.id,
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: it.quantity,
          price: Number(it.price),
          image_url: it.image_url,
        })),
      });
    }
    return res.json(orders);
  } catch (err: any) {
    console.error('[Get Orders Error]:', err);
    return res.status(500).json({ message: `Database error fetching orders: ${err.message}` });
  }
});

async function startServer() {
  await initDB();

  // Vite Development Integration or Static Production Server
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rukhi Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
