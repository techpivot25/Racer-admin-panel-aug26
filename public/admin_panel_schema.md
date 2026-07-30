# RACER ENTERPRISE ADMIN PANEL - MASTER DATABASE SCHEMA SPECIFICATION
**Version:** 2.4.0  
**Domain:** Enterprise SLA Licensing & Billing Admin Infrastructure  
**Generated Date:** 2026-07-26  

---

## 1. System Overview
The RACER Enterprise Admin Panel database manages authentication, enterprise customer tenants, product software modules, SLA contracts, seat allocations, hardware host activations, technical documentation assets, and compliance audit logs.

---

## 2. Core Relational Entities & Schemas

### 2.1 `account` (Core Auth)
*Billing and main administrative tenant account entity.*
- `id` (VARCHAR, PRIMARY KEY) - Account UUID or string ID.
- `email` (VARCHAR, NOT NULL) - Main billing account email.
- `date_created` (TIMESTAMP, NOT NULL) - Registration timestamp.
- `stripe_customer_id` (VARCHAR, NULLABLE) - Stripe billing integration customer ID.
- `stripe_subscription_id` (VARCHAR, NULLABLE) - Active Stripe subscription ID.
- `plan` (VARCHAR, NULLABLE) - Active subscription plan (Enterprise, Professional, Starter).
- `referrer` (VARCHAR, NULLABLE) - Referral source.
- `active` (TINYINT, NULLABLE) - 1 for Active, 0 for Inactive.

### 2.2 `invite` (Core Auth)
*Admin panel user invitation tokens.*
- `id` (INT, PRIMARY KEY AUTO_INCREMENT) - Numeric ID.
- `invite_id` (VARCHAR, NULLABLE) - Cryptographic invitation UUID string.
- `email` (VARCHAR, NULLABLE) - Recipient email.
- `account_id` (VARCHAR, FOREIGN KEY -> `account.id`) - Associated account.
- `date_sent` (TIMESTAMP, NULLABLE) - Sent timestamp.
- `used` (TINYINT, NULLABLE) - 1 if claimed, 0 if pending.

### 2.3 `user` (Core Auth)
*Operator user accounts with credentials and roles.*
- `id` (VARCHAR, PRIMARY KEY) - User UUID.
- `name` (VARCHAR, NULLABLE) - Display name.
- `email` (VARCHAR, NOT NULL) - Login email.
- `password` (VARCHAR, NOT NULL) - Bcrypt password hash.
- `date_created` (TIMESTAMP, NOT NULL) - Account registration timestamp.
- `last_login` (TIMESTAMP, NULLABLE) - Last active timestamp.
- `permission` (VARCHAR, NULLABLE) - Role permissions (Super Admin, Sub Admin).
- `push_token` (VARCHAR, NULLABLE) - Push notification token.
- `account_id` (VARCHAR, FOREIGN KEY -> `account.id`) - Parent account reference.

### 2.4 `customer` (Enterprise Tenancy)
*Onboarded corporate enterprise clients.*
- `id` (VARCHAR, PRIMARY KEY) - Customer ID (e.g. CUST-01).
- `account_id` (VARCHAR, FOREIGN KEY -> `account.id`, NULLABLE) - Account link.
- `name` (VARCHAR, NOT NULL) - Legal company name.
- `address` (TEXT, NULLABLE) - Headquarters address.
- `primary_contact_name` (VARCHAR, NULLABLE) - Primary contact person.
- `primary_contact_email` (VARCHAR, NULLABLE) - Primary contact email.
- `phone` (VARCHAR, NULLABLE) - Contact telephone.
- `country` (VARCHAR, NOT NULL) - ISO Country code.
- `support_tier_id` (VARCHAR, FOREIGN KEY -> `support_tier.id`) - Support SLA tier.
- `sso_enabled` (TINYINT, NOT NULL) - Single Sign-On flag (1/0).
- `sso_provider` (VARCHAR, NULLABLE) - Identity Provider (Okta, Azure AD, Google).
- `status` (VARCHAR, NOT NULL) - Customer status (Active, Onboarding, Inactive).
- `created_date` (TIMESTAMP, NOT NULL) - Onboarding timestamp.

### 2.5 `product` (Software Licensing)
*Catalog of software modules and license SKUs.*
- `id` (VARCHAR, PRIMARY KEY) - Product ID.
- `name` (VARCHAR, NOT NULL) - Product commercial name.
- `sku` (VARCHAR, NOT NULL, UNIQUE) - Product SKU code.
- `unit_price` (NUMERIC, NOT NULL) - Standard seat price ($).
- `tier` (VARCHAR, NOT NULL) - Product tier.
- `family` (VARCHAR, NOT NULL) - Product family line.
- `description` (TEXT, NULLABLE) - Technical summary.
- `status` (VARCHAR, NOT NULL) - Active/Inactive.
- `features` (JSON, NULLABLE) - Feature flag list.

### 2.6 `contract` (Software Licensing)
*Binding SLA contracts connecting customers to product seats.*
- `id` (VARCHAR, PRIMARY KEY) - Contract ID (e.g. CON-2026-01).
- `customer_id` (VARCHAR, FOREIGN KEY -> `customer.id`) - Customer owner.
- `product_id` (VARCHAR, FOREIGN KEY -> `product.id`) - Product module.
- `product_sku` (VARCHAR, NOT NULL) - Contracted SKU.
- `unit_price` (NUMERIC, NOT NULL) - Contracted unit seat price.
- `purchased_units` (INT, NOT NULL) - Total purchased seats.
- `active_units` (INT, NOT NULL) - Deployed seats.
- `term_months` (INT, NOT NULL) - Duration in months.
- `start_date` (DATE, NOT NULL) - Activation date.
- `end_date` (DATE, NOT NULL) - Expiration date.
- `is_deleted` (TINYINT, NOT NULL) - Soft delete flag.

### 2.7 `license` (Software Licensing)
*Cryptographic key allocations issued to customer hosts.*
- `id` (VARCHAR, PRIMARY KEY) - License UUID.
- `license_key` (VARCHAR, NOT NULL) - Formatted license key hash.
- `customer_id` (VARCHAR, FOREIGN KEY -> `customer.id`) - Customer owner.
- `product_id` (VARCHAR, FOREIGN KEY -> `product.id`) - Product module.
- `contract_id` (VARCHAR, FOREIGN KEY -> `contract.id`, NULLABLE) - Parent contract.
- `active_units` (INT, NOT NULL) - Active seats.
- `purchased_units` (INT, NOT NULL) - Total seats.
- `list_price` (NUMERIC, NULLABLE) - Standard price.
- `customer_unit_price` (NUMERIC, NULLABLE) - Negotiated rate.
- `term_start_date` (DATE, NULLABLE) - Start date.
- `term_end_date` (DATE, NULLABLE) - End date.
- `is_active` (TINYINT, NOT NULL) - Active flag.

---

## 3. Foreign Key Constraints Summary
- `invite.account_id` -> `account.id`
- `user.account_id` -> `account.id`
- `customer.account_id` -> `account.id`
- `customer.support_tier_id` -> `support_tier.id`
- `contract.customer_id` -> `customer.id`
- `contract.product_id` -> `product.id`
- `license.customer_id` -> `customer.id`
- `license.product_id` -> `product.id`
- `license.contract_id` -> `contract.id`
- `customer_product_mapping.customer_id` -> `customer.id`
- `customer_product_mapping.product_id` -> `product.id`
- `host_activation.customer_id` -> `customer.id`
- `host_activation.contract_id` -> `contract.id`
