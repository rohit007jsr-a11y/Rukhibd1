import { User, Product, Order } from '../types';

export const authStorage = {
  getUser: (): User | null => {
    try {
      const data = localStorage.getItem('rukhi_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User) => {
    try {
      localStorage.setItem('rukhi_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to set localStorage user', e);
    }
  },
  setAuth: (user: User, token: string) => {
    try {
      localStorage.setItem('rukhi_user', JSON.stringify(user));
      localStorage.setItem('rukhi_token', token);
    } catch (e) {
      console.error('Failed to set localStorage', e);
    }
  },
  clearAuth: () => {
    try {
      localStorage.removeItem('rukhi_user');
      localStorage.removeItem('rukhi_token');
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
  },
};

export async function fetchProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to local data', error);
    return [];
  }
}

export async function sendOtpApi(email: string, type: 'signup' | 'login') {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send verification code');
  return data;
}

export async function verifyOtpApi(email: string, code: string) {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to verify code');
  return data;
}

export async function loginUserApi(email: string, password?: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function registerUserApi(payload: {
  email: string;
  fullName: string;
  phone: string;
  address?: string;
  password?: string;
}) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function createOrder(orderPayload: any) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to place order');
  return data;
}

export async function fetchUserOrders(userId?: string, email?: string): Promise<Order[]> {
  try {
    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    if (email) query.append('email', email);

    const res = await fetch(`/api/orders?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch user orders');
    return await res.json();
  } catch (error) {
    console.error('Fetch user orders error:', error);
    return [];
  }
}
