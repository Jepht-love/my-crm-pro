import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Tenant = {
  id: string
  name: string
  slug: string
  stripe_customer_id: string | null
  subscription_status: string
  created_at: string
}

export type User = {
  id: string
  tenant_id: string
  role: 'super_admin' | 'tenant_owner'
  email: string
  created_at: string
}

export type Product = {
  id: string
  tenant_id: string
  name: string
  price: number | null
  stock_quantity: number
  created_at: string
}

export type Order = {
  id: string
  tenant_id: string
  customer_email: string | null
  status: string
  total_amount: number | null
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
}
