-- Migration: create orders table

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid null,
  order_number varchar unique not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  shipping_price numeric(10,2) not null,
  total numeric(10,2) not null,
  status varchar default 'pending',
  shipping_address jsonb,
  billing_address jsonb,
  payment_method varchar,
  payment_id varchar,
  tracking_number varchar,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
