import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
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
  ssl: process.env.DATABASE_URL?.includes('render') || process.env.DATABASE_URL?.includes('supabase')
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

// In-Memory OTP store
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// API Routes

// Health Check
app.get('/api/db-health', async (_req, res) => {
  if (!dbConnected) {
    return res.json({ connected: false, message: 'Running in fallback in-memory mode' });
  }
  try {
    const dbRes = await pool.query('SELECT version()');
    return res.json({ connected: true, version: dbRes.rows[0].version });
  } catch (err) {
    return res.json({ connected: false, error: (err as Error).message });
  }
});

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Valid email address is required.' });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email.toLowerCase(), { code: otpCode, expiresAt });

  let sentViaSmtp = false;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Rukhi Bangladesh" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${otpCode} is your Rukhi verification code`,
        text: `Your verification code for Rukhi Cash-on-Delivery Marketplace is: ${otpCode}. Valid for 10 minutes.`,
      });
      sentViaSmtp = true;
    } catch (e) {
      console.error('[SMTP Error]:', e);
    }
  }

  return res.json({
    success: true,
    message: `Verification code generated for ${email}`,
    sentViaSmtp,
    devOtp: otpCode,
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  const stored = otpStore.get(email.toLowerCase());

  if (!stored) {
    return res.status(400).json({ message: 'No OTP requested for this email or it expired.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ message: 'Verification code expired. Please request a new code.' });
  }

  if (stored.code !== code) {
    return res.status(400).json({ message: 'Invalid 6-digit code. Please check and try again.' });
  }

  otpStore.delete(email.toLowerCase());
  return res.json({ success: true, message: 'OTP verified successfully.' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, fullName, phone, address, password } = req.body;

  if (!email || !phone) {
    return res.status(400).json({ message: 'Email and mobile phone number are required.' });
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (dbConnected) {
    try {
      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        // Update user
        const updated = await pool.query(
          'UPDATE users SET full_name = $1, phone = $2, address = $3 WHERE email = $4 RETURNING *',
          [fullName, phone, address, email]
        );
        const u = updated.rows[0];
        return res.json({
          success: true,
          user: { id: u.id, email: u.email, full_name: u.full_name, phone: u.phone, address: u.address },
        });
      }

      const inserted = await pool.query(
        'INSERT INTO users (email, full_name, phone, address, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [email, fullName, phone, address, hashedPassword]
      );
      const u = inserted.rows[0];
      return res.json({
        success: true,
        user: { id: u.id, email: u.email, full_name: u.full_name, phone: u.phone, address: u.address },
      });
    } catch (e) {
      console.error('[Register DB Error]:', e);
    }
  }

  return res.json({
    success: true,
    user: { id: userId, email, full_name: fullName, phone, address },
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  if (dbConnected) {
    try {
      const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        if (password && u.password_hash) {
          const match = await bcrypt.compare(password, u.password_hash);
          if (!match) {
            return res.status(400).json({ message: 'Incorrect password.' });
          }
        }
        return res.json({
          success: true,
          user: { id: u.id, email: u.email, full_name: u.full_name, phone: u.phone, address: u.address },
        });
      }
    } catch (e) {
      console.error('[Login DB Error]:', e);
    }
  }

  return res.json({
    success: true,
    user: {
      id: `usr_${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      phone: '01700000000',
    },
  });
});

// Get Products
app.get('/api/products', async (req, res) => {
  const { category, q } = req.query;

  if (dbConnected) {
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
    } catch (err) {
      console.error('[Get Products Error]:', err);
    }
  }

  // Fallback
  return res.json([]);
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

  const orderNum = `RK-BD-${Math.floor(100000 + Math.random() * 900000)}`;
  const totalPrice = Number(subtotal) + Number(delivery_fee);
  const createdAt = new Date().toISOString();

  if (dbConnected) {
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
    } catch (e) {
      await client.query('ROLLBACK');
      client.release();
      console.error('[Create Order Error]:', e);
    }
  }

  // In-Memory Fallback Order Response
  return res.json({
    success: true,
    order: {
      id: `ord_${Date.now()}`,
      order_number: orderNum,
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      total_price: totalPrice,
      payment_method: 'Cash on Delivery',
      status: 'Processing',
      created_at: createdAt,
    },
  });
});

// Get User Orders
app.get('/api/orders', async (req, res) => {
  const { user_id, email } = req.query;

  if (dbConnected) {
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
    } catch (err) {
      console.error('[Get Orders Error]:', err);
    }
  }

  return res.json([]);
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
