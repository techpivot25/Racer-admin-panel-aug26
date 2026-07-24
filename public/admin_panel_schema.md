# RACER Admin Panel - Master Database Schema & System Architecture

This document contains the official comprehensive system schema, entity types, and relationship boundaries for the RACER Admin Control Panel. It serves as the single source of truth for database modeling, developer integration, and system audatability.

---

## 1. System-Wide Entity Relationship Diagram (ERD)

```text
  ┌─────────────────┐             ┌───────────────────┐             ┌───────────────────┐
  │   AdminUser     │             │     Customer      │             │      License      │
  ├─────────────────┤             ├───────────────────┤             ├───────────────────┤
  │ uuid (PK)       │             │ id (PK)           │             │ id (PK)           │
  │ email           │◄───────────┼│ primaryContactEm. │             │ companyId (FK)───┐│
  │ customerId (FK)─┼────────────┐│ parentId (FK)     │             │ sku (FK)          ││
  └─────────────────┘            │└─────────┬─────────┘             └─────────┬─────────┘│
                                 │          │                                 │          │
                                 │          │ 1                               │ 1        │
                                 │          │                                 │          │
  ┌─────────────────┐            │          │ N                               │ N        │
  │    Contract     │            │          ▼                                 ▼          │
  ├─────────────────┤            │   ┌──────────────┐                 ┌──────────────┐   │
  │ id (PK)         │            │   │   DocItem    │                 │ProductBinary │   │
  │ customerId (FK)─┼────────────┤   ├──────────────┤                 ├──────────────┤   │
  │ productSku (FK) ├───────────┐│   │ id (PK)      │                 │ id (PK)      │   │
  └─────────────────┘           ││   │ targetCustIds│                 │ productSku   │   │
                                ││   └──────────────┘                 └──────────────┘   │
                                ││                                                       │
  ┌─────────────────┐           ││   ┌───────────────────────────┐                       │
  │     Product     │           │└──►│  CustomerProductMapping   │                       │
  ├─────────────────┤           │    ├───────────────────────────┤                       │
  │ id (PK)         │           │    │ id (PK)                   │                       │
  │ sku (Unique)    │◄──────────┴────│ customerId (FK)           │                       │
  └─────────────────┘                │ productId (FK)            │                       │
                                     │ productSku (FK)           │                       │
                                     └───────────────────────────┘                       │
                                                                                         │
  ┌───────────────────────┐                                                              │
  │ ProductSupportRecord  │◄─────────────────────────────────────────────────────────────┘
  ├───────────────────────┤
  │ id (PK)               │
  │ productId (FK)        │
  │ customerIds (Array)   │
  └───────────────────────┘
```

---

## 2. Comprehensive Table Definitions & Specifications

### 2.1 AdminUser
Represents users authorized to manage the platform, covering Super Admins, billing specialists, and tenant administrators.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `uuid` | `UUID` / `String` | PK | No | Unique identifier for the administrator session / identity. |
| `firstName` | `Varchar(100)` | - | No | First name of the system user. |
| `lastName` | `Varchar(100)` | - | No | Last name of the system user. |
| `title` | `Varchar(150)` | - | Yes | Business title / Designation. |
| `phone` | `Varchar(40)` | - | Yes | International telephone format: `+E.164`. |
| `email` | `Varchar(255)` | Unique | No | Canonical e-mail address. Used as login credentials. |
| `customerId` | `String` | FK | No | Links to `Customer.id`. Restricts user context. |
| `customerName` | `Varchar(255)` | - | No | Denormalized customer company name for rapid rendering. |
| `customerTierId` | `String` | - | Yes | Internal tier classification for the linked customer entity. |
| `customerTier` | `String` | - | Yes | Descriptive support/billing tier (e.g. Gold, Standard). |
| `notes` | `Text` | - | Yes | Administrative scratchpad notes. |
| `createDate` | `ISO-8601 Date` | - | No | Timestamp of account provisioning. |
| `createdBy` | `Varchar(255)`| - | No | Admin email who initiated the record. |
| `lastModified` | `ISO-8601 Date`| - | No | Timestamp of the most recent profile update. |
| `lastModifiedBy` | `Varchar(255)`| - | No | Admin email who performed the last write. |
| `isAdminUser` | `Boolean` | - | No | Flag indicating if user is an internal platform administrator. |
| `adminRole` | `Enum` | - | Yes | `Super Admin`, `Billing Specialist`, `Support Specialist`, `User Admin`, `Customer Operator`. |
| `authMethod` | `Enum` | - | No | Auth mechanism: `local` (password) or `sso`. |
| `ssoProvider` | `Varchar(100)` | - | Yes | External identity provider name (e.g. Okta, Azure AD, G-Suite). |

---

### 2.2 Customer
Represents enterprise tenants or clients signed up for RACER binary packages.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Unique alphanumeric reference (e.g., `CUST-992`). |
| `name` | `Varchar(255)` | Unique | No | Complete corporate enterprise registration name. |
| `address` | `Text` | - | No | Complete physical headquarters shipping and billing address. |
| `primaryContactName`| `Varchar(150)` | - | No | Direct point of contact for operational alerts. |
| `primaryContactPhone`| `Varchar(40)` | - | No | Primary contact telephone. |
| `primaryContactEmail`| `Varchar(255)` | - | No | Primary contact canonical e-mail address. |
| `billingContactName`| `Varchar(150)` | - | No | Assigned accountant or billing lead. |
| `billingContactPhone`| `Varchar(40)` | - | No | Billing contact telephone number. |
| `billingContactEmail`| `Varchar(255)` | - | No | Invoice delivery target e-mail address. |
| `supportTier` | `Enum` | - | No | Support tier SLAs: `Gold Support Model` or `Standard Support Model`. |
| `supportContactName`| `Varchar(150)` | - | No | Customer technical account manager or primary liaison. |
| `supportContactPhone`| `Varchar(40)` | - | No | Support escalation hotline. |
| `supportContactEmail`| `Varchar(255)` | - | No | Ticketing / Support desk email. |
| `notes` | `Text` | - | Yes | General notes, custom requirements, or enterprise caveats. |
| `createDate` | `ISO-8601 Date` | - | No | Onboarding registry date. |
| `createdBy` | `Varchar(255)`| - | No | Provisioner username. |
| `lastModified` | `ISO-8601 Date`| - | No | Last modification datetime. |
| `lastModifiedBy` | `Varchar(255)`| - | No | Editor username. |
| `parentId` | `String` | FK | Yes | Self-referencing FK linking to `Customer.id` for parent-subsidiary structures. |
| `status` | `Enum` | - | No | Operational authorization status: `Active` or `Blocked`. |
| `ssoEnabled` | `Boolean` | - | No | Flag indicating if SSO is configured for all users matching domain. |
| `ssoProvider` | `Varchar(100)` | - | Yes | SAML 2.0 / OIDC Identity Provider (e.g. Ping Identity, Microsoft Entra). |
| `ssoProtocol` | `Enum` | - | Yes | Federative security protocol: `SAML2`, `OIDC`, `WS-Fed`. |
| `ssoDomain` | `Varchar(255)` | - | Yes | Verified email domain suffix (e.g., `jolie-labs.com`) for routing. |
| `ssoUrl` | `Varchar(512)` | - | Yes | Single-sign on authentication gateway destination endpoint. |

---

### 2.3 Product
The master registry of active software modules, packages, and binaries offered by RACER.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Uniquely mapped internal binary ID (e.g., `PROD-001`). |
| `name` | `Varchar(200)` | - | No | Technical nomenclature of the software (e.g. BJ Secure Node core). |
| `description` | `Text` | - | Yes | Functional capabilities summary of the compiled binary module. |
| `tierName` | `Varchar(100)` | - | No | Distribution tier classification. |
| `sku` | `Varchar(100)` | Unique | No | Universal product identifier (e.g. `BJ-COMPUTE-ENT-001`). |
| `unitPrice` | `Decimal(12,2)` | - | No | Standard catalog price per user license / node deployment. |
| `family` | `Varchar(150)` | - | No | Product grouping hierarchy (e.g. Compute, Security, Auditing). |
| `customerIds` | `Array[String]` | FK | No | Multi-value array linking Customer IDs licensed for this module. |
| `notes` | `Text` | - | Yes | Release notes, build restrictions, or end-of-life schedules. |
| `createDate` | `ISO-8601 Date` | - | No | Date added to RACER service catalog. |
| `createdBy` | `Varchar(255)`| - | No | Catalog manager username. |
| `lastModified` | `ISO-8601 Date`| - | No | Datetime of last specification revision. |
| `lastModifiedBy` | `Varchar(255)`| - | No | Editor username. |

---

### 2.4 Contract
Tracks procurement agreements, purchased license quantities, active counts, and durations.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Unique transaction receipt identifier (e.g., `CON-9021`). |
| `name` | `Varchar(255)` | - | No | Descriptive title of purchase order or contract. |
| `description` | `Text` | - | Yes | Scope of license coverage or distribution rights. |
| `customerId` | `String` | FK | No | Mapped to `Customer.id`. |
| `customerName` | `Varchar(255)` | - | No | Denormalized customer company name. |
| `productSku` | `Varchar(100)` | FK | No | Mapped to `Product.sku`. |
| `productName` | `Varchar(200)` | - | No | Denormalized product name. |
| `unitPrice` | `Decimal(12,2)` | - | No | Negotiated contractual unit price. |
| `purchasedUnits` | `Integer` | - | No | Total quantity of allocations acquired by tenant. |
| `activeUnits` | `Integer` | - | No | Live validated license keys registered. Must be $\le$ `purchasedUnits`. |
| `termMonths` | `Integer` | - | No | Validation duration (e.g. 12 months, 36 months). |
| `startDate` | `ISO-8601 Date` | - | No | Commencement date of entitlement. |
| `endDate` | `ISO-8601 Date` | - | No | Expiration threshold of legal use. |
| `createDate` | `ISO-8601 Date` | - | No | Entry database registration date. |
| `createdBy` | `Varchar(255)`| - | No | Billing specialist operator email. |
| `lastUpdated` | `ISO-8601 Date`| - | No | Date of last amendment or renewal. |
| `lastUpdatedBy` | `Varchar(255)`| - | No | Last modifying admin email. |

---

### 2.5 License
Cryptographic certificates generated to unlock localized distributions of RACER nodes.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Verification unique serial (e.g. `LIC-99104-ND`). |
| `companyId` | `String` | FK | No | Mapped to `Customer.id`. |
| `companyName` | `Varchar(255)` | - | No | Denormalized enterprise name. |
| `authPerson` | `Varchar(255)` | - | No | Technical employee responsible for localized keys. |
| `licenseKey` | `Varchar(512)` | Unique | No | Cryptographic public/private validation token. |
| `sku` | `Varchar(100)` | FK | No | Mapped to `Product.sku`. |
| `renewalDate` | `ISO-8601 Date` | - | No | Hard lock threshold before node triggers local grace state. |
| `isActive` | `Boolean` | - | No | Current status of authentication validation. |
| `email` | `Varchar(255)` | - | No | Communication address linked to key issuance. |
| `listPrice` | `Decimal(12,2)` | - | Yes | Recommended public retail catalog unit price. |
| `customerUnitPrice`| `Decimal(12,2)` | - | Yes | Discounted pricing negotiated under master contract. |
| `termStartDate` | `ISO-8601 Date` | - | Yes | Onset timestamp of physical license term. |
| `termMonths` | `Integer` | - | Yes | Active terms allocated. |
| `termEndDate` | `ISO-8601 Date` | - | Yes | Hard expiration boundary date. |
| `initialAuthState` | `Enum` | - | Yes | Initial deployment mode: `Active`, `Blocked`, or `POC`. |

---

### 2.6 DocItem
Contains administrative handbooks, product manuals, API specifications, and SLA sheets.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Unique asset metadata identifier. |
| `title` | `Varchar(255)` | - | No | Editorial name of documentation document. |
| `category` | `Enum` | - | No | `Product Documentation` or `Support Documentation`. |
| `associatedProducts`| `Array[String]` | FK | No | Array of `Product.sku` matching applicability. |
| `isPublished` | `Boolean` | - | No | Visibility flag control. |
| `notes` | `Text` | - | Yes | Revisions log / audience warnings. |
| `uploadDate` | `ISO-8601 Date` | - | No | Upload database timestamp. |
| `lastModified` | `ISO-8601 Date` | - | No | Last manual adjustment timestamp. |
| `fileSize` | `Varchar(50)` | - | No | Formatted file payload footprint (e.g. `4.2 MB`). |
| `targetCustomerIds`| `Array[String]` | FK | Yes | Filter limits scope to a subset of customer accounts (nullable means public). |

---

### 2.7 ProductBinary
Compiled product distributions ready for direct deployment by enterprise administrators.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Alphanumeric build reference. |
| `fileName` | `Varchar(255)` | - | No | Physical build target file name (e.g., `racer_node_core_v1.4.tar.gz`). |
| `version` | `Varchar(30)` | - | No | SemVer standard tag (e.g. `1.4.0-release`). |
| `productSku` | `Varchar(100)` | FK | No | Mapped to `Product.sku`. |
| `productName` | `Varchar(200)` | - | No | Denormalized technical name. |
| `fileSize` | `Varchar(50)` | - | No | Formatted payload size (e.g. `142 MB`). |
| `uploadDate` | `ISO-8601 Date` | - | No | Deployment release pipeline finish date. |
| `md5Checksum` | `Char(32)` | - | No | Integrity verification token for secure customer downloads. |
| `targetCustomerIds`| `Array[String]` | FK | No | Access control list checking which Customer accounts are eligible to sync. |
| `notes` | `Text` | - | Yes | Dependencies, build configurations, and CLI arguments. |

---

### 2.8 SupportTierInfo
Global service-level metrics defining response SLAs, direct escalation hotlines, and channels.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Alphanumeric classification tag. |
| `name` | `Varchar(100)` | Unique | No | Master tier model (e.g. Gold Support Model, Standard). |
| `responseTime` | `Varchar(100)` | - | No | SLA maximum response wait time (e.g. "1 Hour Critical"). |
| `coverageHours` | `Varchar(100)` | - | No | Operating coverage window (e.g., "24/7/365" or "9-5 Business Days"). |
| `channels` | `Array[String]` | - | No | Valid contact systems (e.g., `["Email", "Phone", "Slack Portal"]`). |
| `notes` | `Text` | - | Yes | Structural parameters. |
| `maxTickets` | `Integer` | - | Yes | Concurrency cap on active client helpdesk requests. |
| `directPhoneAccess`| `Boolean` | - | Yes | Immediate engineering callback capability flag. |
| `dedicatedLiaison` | `Boolean` | - | Yes | Designated Customer Success Engineer assigned to account. |

---

### 2.9 ProductSupportRecord
Tracks active product SLAs, engineering contact points, support workflows, and criticalities.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | SLA mapping code. |
| `productId` | `String` | FK | No | Links to `Product.id`. |
| `productSku` | `Varchar(100)` | FK | No | Mapped to `Product.sku`. |
| `productName` | `Varchar(200)` | - | No | Denormalized product classification. |
| `sloDetails` | `Text` | - | No | Core service level agreements and criteria. |
| `responseTime` | `Varchar(100)` | - | No | Standard response benchmark target. |
| `supportContactName`| `Varchar(150)` | - | No | Operational support lead. |
| `supportContactPhone`| `Varchar(40)` | - | No | Engineering escalations hotline. |
| `supportContactEmail`| `Varchar(255)` | - | No | Direct support team mailbox address. |
| `supportWorkflow` | `Array[String]` | - | No | Staged remediation workflow path steps. |
| `customerIds` | `Array[String]` | FK | No | List of customer accounts attached to this SLA configuration. |
| `notes` | `Text` | - | Yes | Special caveats, custom tools, or offline runbooks. |
| `severityLevel` | `Enum` | - | No | `P1 - Critical`, `P2 - High`, `P3 - Medium`, `P4 - Low`. |
| `coverageHours` | `Varchar(100)` | - | No | Window of active operations. |

---

### 2.10 AuditRecord
Tracks all user actions, security status updates, blocking maneuvers, and billing changes.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Auto-incremental / unique UUID audit trail key. |
| `timestamp` | `ISO-8601 Date` | - | No | Instant date and exact UTC timestamp when action completed. |
| `action` | `Varchar(255)` | - | No | Human-readable activity name (e.g. Blocked User, Allocated License). |
| `user` | `Varchar(255)` | - | No | Executing Super Admin email account identifier. |
| `details` | `Text` | - | No | JSON-serializable string or text containing delta changes. |
| `screen` | `Enum` | - | No | Scope: `Users`, `Customers`, `Products`, `General`, `Licenses`, `Support`. |

---

### 2.11 CustomerProductMapping
Maps price metrics, active licensing terms, and products assigned to specific clients.

| Field Name | Type | Key | Nullable | Description / Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `id` | `String` | PK | No | Mapped assignment key. |
| `customerId` | `Integer` | FK | No | Links to Customer numeric integer identifier. |
| `productId` | `Integer` | FK | No | Links to Product numeric integer identifier. |
| `productSku` | `Varchar(100)` | FK | No | Mapped value linking `Product.sku`. |
| `productUnitPrice` | `Decimal(12,2)` | - | No | General base standard public retail pricing. |
| `customerUnitPrice`| `Decimal(12,2)` | - | No | Contract-specific price assigned to this customer instance. |

---

## 3. Data Integrity & Key Relations Reference

1. **Cascade Triggers:**
   - When a `Customer` is set to `Blocked`, all associated `License` records map to `isActive = false` to inhibit node verification.
   - When a `Customer` parent relationship is deleted, child entities are re-parented to the highest logical ancestor or set to null.

2. **Uniqueness Boundaries:**
   - `Product.sku` must be unique across the catalog to prevent license authentication collision.
   - `AdminUser.email` holds uniqueness constraint to avoid identity overlaps in the administrative console.

---

*Compiled by Sarah Connor, Super Admin Support Liaison, RACER System Operations.*
*Generated on: 2026-07-09*
