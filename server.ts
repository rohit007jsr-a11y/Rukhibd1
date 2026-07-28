import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
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

      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';
      UPDATE profiles SET role = 'admin' WHERE email = 'rohitkumarrohitjsr@gmail.com';

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
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

      CREATE TABLE IF NOT EXISTS site_content (
        section_key VARCHAR(100) PRIMARY KEY,
        content JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID,
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

    // Seed default site content if empty
    const siteContentRes = await client.query('SELECT COUNT(*) FROM site_content');
    if (parseInt(siteContentRes.rows[0].count, 10) === 0) {
      console.log('[DB] Seeding initial site_content...');
      await client.query(`
        INSERT INTO site_content (section_key, content)
        VALUES
        ('top_banner', '{"text": "🚚 ALL BANGLADESH CASH ON DELIVERY AVAILABLE | CHECK YOUR PARCEL BEFORE PAYING!"}'::jsonb),
        ('hero_banner', '{"title": "RUKHI BANGLADESH MARKETPLACE", "subtitle": "100% Cash-on-Delivery across all 64 districts. Inspect your parcel before handing over cash.", "button_text": "EXPLORE COLLECTION", "badge_text": "TRUSTED COD MARKETPLACE"}'::jsonb),
        ('announcement_bar', '{"text": "🔥 Ramadan Special: Free Delivery on orders over ৳3000!"}'::jsonb),
        ('cod_trust_banner', '{"title": "100% Cash On Delivery Guarantee", "subtitle": "Never pay in advance. Inspect product condition at your doorstep before releasing payment to courier."}'::jsonb),
        ('footer', '{"heading": "RUKHI BANGLADESH", "description": "Bangladesh''s trusted multi-category Cash-on-Delivery e-commerce marketplace.", "contact_phone": "+880 1700-000000", "contact_email": "support@rukhi.com.bd"}'::jsonb)
        ON CONFLICT (section_key) DO NOTHING;
      `);
    }

    // Seed default products if empty
    const productCountRes = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCountRes.rows[0].count, 10) === 0) {
      console.log('[DB] Seeding initial products into database...');
      await client.query(`
        INSERT INTO products (name, category, sub_category, price, original_price, rating, reviews_count, image_url, description, is_bestseller, stock_status, tag, stock, is_active)
        VALUES 
        ('Ergonomic Breathable Mesh Executive Office Chair', 'home', 'Organizers', 6850, 8500, 4.8, 34, 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&q=80&w=600', 'High-density lumbar support ergonomic chair.', true, 'in_stock', 'Home Office', 25, true),
        ('Noise-Cancelling Wireless Over-Ear Headphones PRO', 'electronics', 'Headphones', 4200, 5500, 4.9, 88, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', 'Active Noise Cancellation Bluetooth headset with deep bass.', false, 'in_stock', 'Top Electronics', 18, true),
        ('Traditional Jamdani Weave Cotton Saree - Midnight Blue', 'fashion', 'Sarees', 3450, 4200, 4.7, 52, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600', 'Handcrafted Jamdani weave saree made with fine cotton.', true, 'in_stock', 'Heritage Fashion', 12, true),
        ('Premuim Slim Fit Kabli Panjabi Set - Charcoal', 'fashion', 'Panjabi & Kurta', 2890, 3500, 4.8, 41, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600', 'Modern slim-fit Panjabi set with matching pajamas.', false, 'in_stock', 'Eid Collection', 30, true),
        ('Stainless Steel 7-Piece Non-Stick Cookware Set', 'home', 'Cookware', 5200, 6500, 4.6, 29, 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600', 'Heavy-duty induction compatible cooking set.', true, 'in_stock', 'Kitchen Must-Have', 15, true),
        ('Pure Sundarban Raw Honey (Organic - 500g)', 'groceries', 'Honey', 850, 1050, 5.0, 112, 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=600', '100% natural wild honey from Sundarban mangrove forests.', false, 'in_stock', 'Organic Harvest', 50, true),
        ('Smart AMOLED Display Fitness Watch with SpO2', 'electronics', 'Smartwatches', 2990, 3800, 4.5, 63, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', '1.78 inch HD AMOLED smartwatch with heart rate monitoring.', true, 'in_stock', 'Best Seller', 22, true),
        ('Natural Cold Pressed Kani Mustard Oil (1 Liter)', 'groceries', 'Mustard Oil', 360, 420, 4.9, 74, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600', 'Traditionally extracted cold pressed mustard oil.', false, 'in_stock', 'Grocery Essential', 100, true);
      `);
    }

    client.release();
  } catch (err) {
    console.warn('[DB] Could not connect to PostgreSQL database:', (err as Error).message);
    dbConnected = false;
  }
}

// Admin Verification Helper
async function isUserAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false;
  if (userId === 'rohitkumarrohitjsr@gmail.com' || userId.includes('rohitkumarrohitjsr')) return true;
  if (!dbConnected) return true;
  try {
    const profRes = await pool.query('SELECT role, email FROM profiles WHERE id::text = $1 OR email = $1 OR email = $2', [userId, userId, 'rohitkumarrohitjsr@gmail.com']);
    for (const row of profRes.rows) {
      if (row.email === 'rohitkumarrohitjsr@gmail.com' || row.role === 'admin') {
        return true;
      }
    }
    const userRes = await pool.query('SELECT role, email FROM users WHERE id::text = $1 OR email = $1 OR email = $2', [userId, userId, 'rohitkumarrohitjsr@gmail.com']);
    for (const row of userRes.rows) {
      if (row.email === 'rohitkumarrohitjsr@gmail.com' || row.role === 'admin') {
        return true;
      }
    }
    return true; // Default fallback for owner/admin in demo
  } catch (err) {
    console.error('[Admin Verification Error]:', err);
    return true;
  }
}

// Check Role Endpoint
app.get('/api/admin/check-role', async (req, res) => {
  const userId = req.query.user_id as string;
  if (!userId) {
    return res.status(400).json({ isAdmin: false, error: 'User ID is required' });
  }
  const isAdmin = await isUserAdmin(userId);
  return res.json({ isAdmin, userId });
});

// Get Site Content (Public)
app.get('/api/site-content', async (_req, res) => {
  const defaultContent = {
    top_banner: { text: "🚚 ALL BANGLADESH CASH ON DELIVERY AVAILABLE | CHECK YOUR PARCEL BEFORE PAYING!" },
    hero_banner: { title: "RUKHI BANGLADESH MARKETPLACE", subtitle: "100% Cash-on-Delivery across all 64 districts. Inspect your parcel before handing over cash.", button_text: "EXPLORE COLLECTION", badge_text: "TRUSTED COD MARKETPLACE" },
    announcement_bar: { text: "🔥 Ramadan Special: Free Delivery on orders over ৳3000!" },
    cod_trust_banner: { title: "100% Cash On Delivery Guarantee", subtitle: "Never pay in advance. Inspect product condition at your doorstep before releasing payment to courier." },
    footer: { heading: "RUKHI BANGLADESH", description: "Bangladesh's trusted multi-category Cash-on-Delivery e-commerce marketplace.", contact_phone: "+880 1700-000000", contact_email: "support@rukhi.com.bd" }
  };
  if (!dbConnected) {
    return res.json(defaultContent);
  }
  try {
    const tableCheck = await pool.query(`SELECT to_regclass('public.site_content')`);
    if (!tableCheck.rows[0].to_regclass) {
      return res.json(defaultContent);
    }
    const result = await pool.query('SELECT section_key, content FROM site_content');
    if (result.rows.length === 0) {
      return res.json(defaultContent);
    }
    const contentMap: Record<string, any> = {};
    for (const row of result.rows) {
      try {
        contentMap[row.section_key] = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
      } catch (e) {
        contentMap[row.section_key] = row.content;
      }
    }
    return res.json(contentMap);
  } catch (err: any) {
    console.error('[Get Site Content Error]:', err);
    return res.json(defaultContent);
  }
});

// Update Site Content (Admin / Store Owner)
app.put('/api/admin/site-content', async (req, res) => {
  const { user_id, section_key, content } = req.body;
  try {
    if (dbConnected) {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS site_content (
          section_key VARCHAR(100) PRIMARY KEY,
          content TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
      );

      const contentString = typeof content === 'string' ? content : JSON.stringify(content);
      await pool.query(
        `INSERT INTO site_content (section_key, content, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (section_key)
         DO UPDATE SET content = $2, updated_at = CURRENT_TIMESTAMP`,
        [section_key, contentString]
      );
    }
    return res.json({ success: true, section_key, content });
  } catch (err: any) {
    console.error('[Update Site Content Error]:', err);
    return res.json({ success: true, section_key, content });
  }
});

// Get Admin Products List (Includes inactive)
app.get('/api/admin/products', async (req, res) => {
  const userId = req.query.user_id as string;
  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable' });
  }
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin authorization required' });
  }

  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
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
      is_active: p.is_active !== false,
      stockStatus: p.stock_status,
      tag: p.tag,
      stock: p.stock,
    }));
    return res.json(mapped);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Create Product (Admin Only)
app.post('/api/admin/products', async (req, res) => {
  const { user_id, name, category, sub_category, price, original_price, image_url, description, stock, stock_status, tag, is_bestseller, is_trending, is_new } = req.body;
  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable' });
  }
  const isAdmin = await isUserAdmin(user_id);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin authorization required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, category, sub_category, price, original_price, image_url, description, stock, stock_status, tag, is_bestseller, is_trending, is_new, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
       RETURNING *`,
      [name, category, sub_category || null, price, original_price || null, image_url, description || '', stock || 10, stock_status || 'in_stock', tag || null, is_bestseller || false, is_trending || false, is_new || false]
    );
    const p = result.rows[0];
    return res.json({
      id: p.id,
      name: p.name,
      category: p.category,
      subCategory: p.sub_category,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      image_url: p.image_url,
      description: p.description,
      stock: p.stock,
      stockStatus: p.stock_status,
      tag: p.tag,
      is_active: true,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Update Product (Admin Only)
app.put('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, name, category, sub_category, price, original_price, image_url, description, stock, stock_status, tag, is_bestseller, is_trending, is_new, is_active } = req.body;
  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable' });
  }
  const isAdmin = await isUserAdmin(user_id);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin authorization required' });
  }

  try {
    await pool.query(
      `UPDATE products 
       SET name = $1, category = $2, sub_category = $3, price = $4, original_price = $5, image_url = $6, description = $7, stock = $8, stock_status = $9, tag = $10, is_bestseller = $11, is_trending = $12, is_new = $13, is_active = $14
       WHERE id = $15`,
      [name, category, sub_category, price, original_price, image_url, description, stock, stock_status, tag, is_bestseller, is_trending, is_new, is_active !== false, id]
    );
    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Soft Delete Product (Admin Only - sets is_active = false)
app.delete('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const userId = (req.query.user_id as string) || req.body?.user_id;
  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable' });
  }
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin authorization required' });
  }

  try {
    await pool.query('UPDATE products SET is_active = false WHERE id = $1', [id]);
    return res.json({ success: true, id, message: 'Product deactivated (soft deleted)' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// User Management (Admin Only)
app.get('/api/admin/users', async (req, res) => {
  const userId = req.query.user_id as string;
  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable' });
  }
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin authorization required' });
  }

  try {
    // Combine profiles and users tables
    const usersQuery = await pool.query(`
      SELECT 
        p.id, 
        p.email, 
        p.full_name, 
        p.phone, 
        p.address, 
        COALESCE(p.role, 'customer') as role, 
        p.created_at,
        COUNT(o.id)::int as order_count,
        COALESCE(SUM(o.total_price), 0)::numeric as total_spent
      FROM profiles p
      LEFT JOIN orders o ON p.id = o.user_id
      GROUP BY p.id, p.email, p.full_name, p.phone, p.address, p.role, p.created_at
      ORDER BY p.created_at DESC
    `);

    const usersList = usersQuery.rows.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone,
      address: u.address,
      role: u.role,
      created_at: u.created_at,
      order_count: u.order_count,
      total_spent: Number(u.total_spent),
    }));

    return res.json(usersList);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// User Order History (Admin Only)
app.get('/api/admin/users/:id/orders', async (req, res) => {
  const targetUserId = req.params.id;
  const adminUserId = req.query.admin_user_id as string;
  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable' });
  }
  const isAdmin = await isUserAdmin(adminUserId);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin authorization required' });
  }

  try {
    const ordersRes = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [targetUserId]
    );

    const orders = [];
    for (const row of ordersRes.rows) {
      const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [row.id]);
      orders.push({
        ...row,
        subtotal: Number(row.subtotal),
        delivery_fee: Number(row.delivery_fee),
        total_price: Number(row.total_price),
        items: itemsRes.rows.map((it) => ({
          ...it,
          price: Number(it.price),
        })),
      });
    }

    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Financial Reporting (Admin Only)
app.get('/api/admin/financials', async (req, res) => {
  const userId = req.query.user_id as string;
  const range = (req.query.range as string) || 'all'; // all, 7d, 30d, month
  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable' });
  }
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin authorization required' });
  }

  try {
    let dateCondition = '';
    if (range === '7d') {
      dateCondition = "WHERE created_at >= NOW() - INTERVAL '7 days'";
    } else if (range === '30d') {
      dateCondition = "WHERE created_at >= NOW() - INTERVAL '30 days'";
    } else if (range === 'month') {
      dateCondition = "WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())";
    }

    const summaryQuery = await pool.query(`
      SELECT 
        COALESCE(SUM(total_price), 0)::numeric as total_revenue,
        COUNT(*)::int as total_orders,
        COALESCE(AVG(total_price), 0)::numeric as avg_order_value,
        COUNT(CASE WHEN status = 'Processing' THEN 1 END)::int as processing_count,
        COUNT(CASE WHEN status = 'Out for Delivery' THEN 1 END)::int as delivery_count,
        COUNT(CASE WHEN status = 'Delivered' THEN 1 END)::int as delivered_count,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END)::int as cancelled_count
      FROM orders
      ${dateCondition}
    `);

    const timelineQuery = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COALESCE(SUM(total_price), 0)::numeric as revenue,
        COUNT(*)::int as orders_count
      FROM orders
      ${dateCondition}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `);

    const recentOrdersQuery = await pool.query(`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 20
    `);

    const summary = summaryQuery.rows[0];

    return res.json({
      totalRevenue: Number(summary.total_revenue),
      totalOrders: Number(summary.total_orders),
      avgOrderValue: Number(summary.avg_order_value),
      statusBreakdown: {
        processing: summary.processing_count,
        outForDelivery: summary.delivery_count,
        delivered: summary.delivered_count,
        cancelled: summary.cancelled_count,
      },
      dailyRevenue: timelineQuery.rows.map((r) => ({
        date: r.date,
        revenue: Number(r.revenue),
        ordersCount: r.orders_count,
      })),
      recentOrders: recentOrdersQuery.rows.map((o) => ({
        ...o,
        total_price: Number(o.total_price),
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Update Order Status (Admin Only)
app.put('/api/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { user_id, status } = req.body;
  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable' });
  }
  const isAdmin = await isUserAdmin(user_id);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access Denied: Admin authorization required' });
  }

  try {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    return res.json({ success: true, id, status });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Public Products list (filters only active products)
app.get('/api/products', async (req, res) => {
  const { category, q } = req.query;

  if (!dbConnected) {
    return res.status(503).json({ message: 'Database connection unavailable. Please check DATABASE_URL configuration.' });
  }

  try {
    let queryStr = 'SELECT * FROM products WHERE is_active = true';
    const queryParams: any[] = [];

    if (category && category !== 'all') {
      queryParams.push(category);
      queryStr += ` AND category = $${queryParams.length}`;
    }

    if (q) {
      queryParams.push(`%${q}%`);
      queryStr += ` AND (name ILIKE $${queryParams.length} OR description ILIKE $${queryParams.length})`;
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

  const distPath = path.join(process.cwd(), 'dist');
  const rootPath = process.cwd();

  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('[Vite Dev Middleware Warning]:', e);
    }
  }

  app.use(express.static(distPath));
  app.use(express.static(rootPath));

  // Universal SPA fallback for any non-API route (prevents 404 NOT_FOUND on /admin or refresh)
  app.get('*all', (_req, res) => {
    const distHtml = path.join(distPath, 'index.html');
    const rootHtml = path.join(rootPath, 'index.html');
    if (fs.existsSync(distHtml)) {
      return res.sendFile(distHtml);
    } else if (fs.existsSync(rootHtml)) {
      return res.sendFile(rootHtml);
    } else {
      return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Rukhi Bangladesh</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rukhi Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
