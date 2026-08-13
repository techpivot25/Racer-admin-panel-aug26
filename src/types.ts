export type Language = 'EN' | 'FR' | 'ES';

export interface CommunicationLog {
  id: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  sentBy: string;
  templateName?: string;
}

export interface AdminUser {
  uuid: string;
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  email: string;
  customerId: string;
  customerName: string;
  customerTierId: string;
  customerTier: string;
  notes: string;
  createDate: string;
  createdBy: string;
  lastModified: string;
  lastModifiedBy: string;
  isAdminUser: boolean; // Differentiate between Admin UI users and Customer UI users
  adminRole?: 'Super Admin' | 'Admin' | 'Sub Admin' | 'Billing Specialist' | 'Support Specialist' | 'User Admin' | 'Customer Operator' | string;
  permissions?: string[]; // Module permission keys assigned
  password?: string; // Credentials password
  authMethod?: 'local' | 'sso'; // SSO/Local auth method
  ssoProvider?: string; // Linked IDP
  isBlocked?: boolean; // Account block status
  communicationLogs?: CommunicationLog[]; // Sent email history
}

export interface Product {
  id: string;
  name: string;
  description: string;
  tierName: string;
  sku: string;
  unitPrice: number;
  family: string;
  customerIds: string[]; // Associated customers
  notes: string;
  createDate: string;
  createdBy: string;
  lastModified: string;
  lastModifiedBy: string;
  status?: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  billingContactName: string;
  billingContactPhone: string;
  billingContactEmail: string;
  supportTier: 'Gold Support Model' | 'Standard Support Model';
  supportContactName: string;
  supportContactPhone: string;
  supportContactEmail: string;
  notes: string;
  createDate: string;
  createdBy: string;
  lastModified: string;
  lastModifiedBy: string;
  parentId?: string; // Parent organization for sub-entities (Page 5)
  status?: 'Active' | 'Blocked'; // Admin status to block/unblock
  ssoEnabled?: boolean;
  ssoProvider?: string;
  ssoProtocol?: string;
  ssoDomain?: string;
  ssoUrl?: string;
  logoUrl?: string;
  registeredMobile?: string;
  tenant_id?: string; // Unique immutable UUID/alphanumeric tenant identifier e.g. "tnnt_9c8b7a6f..."
  subdomain?: string; // Provisioned dedicated routing subdomain e.g. "wayne.techpivot.in"
  tenantStatus?: 'provisioned' | 'pending' | 'suspended';
  username?: string; // Login identifier e.g. primary contact email
  tempPassword?: string; // Programmatically generated secure temporary hash password
}

export interface ContractProductLineItem {
  id: string;
  contractId?: string;
  productId: string;
  productName: string;
  productSku: string;
  licenseStartDate: string;
  licenseEndDate: string;
  licenseDurationMonths: number;
  defaultPrice: number;
  contractedPrice: number;
  units: number;
}

export interface ContractAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  fileDataUrl?: string;
}

export interface Contract {
  id: string; // Contract ID
  name: string;
  description: string;
  customerId: string;
  customerName: string;
  productSku: string;
  productName: string;
  unitPrice: number;
  purchasedUnits: number;
  activeUnits: number; // For tracking purchased vs active instances
  termMonths: number;
  startDate: string;
  endDate: string;
  createDate: string;
  createdBy: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  isDeleted?: boolean;
  notes?: string;
  attachments?: ContractAttachment[];
  productsLineItems?: ContractProductLineItem[];
}

export interface DocItem {
  id: string;
  title: string;
  category: 'Product Documentation' | 'Support Documentation';
  associatedProducts: string[]; // SKU list
  isPublished: boolean;
  notes: string;
  uploadDate: string;
  lastModified: string;
  fileSize: string;
  targetCustomerIds?: string[]; // Target subset of customers
}

export interface ProductBinary {
  id: string;
  fileName: string;
  version: string;
  productSku: string;
  productName: string;
  fileSize: string;
  uploadDate: string;
  md5Checksum: string;
  targetCustomerIds: string[]; // which customers can download this artifact
  notes: string;
}

export interface SupportTierInfo {
  id: string;
  name: string;
  responseTime: string; // SLA response time e.g., "1 hour"
  coverageHours: string; // SLA coverage e.g., "24/7" or "9-5"
  channels: string[]; // Email, Phone, Chat
  notes: string;
  maxTickets?: number; // Max active support tickets (Page 7)
  directPhoneAccess?: boolean; // Direct phone line access (Page 7)
  dedicatedLiaison?: boolean; // Dedicated Liaison liaison (Page 7)
}

export interface ProductSupportRecord {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  sloDetails: string;
  responseTime: string;
  supportContactName: string;
  supportContactPhone: string;
  supportContactEmail: string;
  supportWorkflow: string[];
  customerIds: string[];
  notes: string;
  severityLevel: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
  coverageHours: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  screen: 'Users' | 'Customers' | 'Products' | 'General' | 'Licenses' | 'Support';
}

export interface License {
  id: string;
  companyId: string; // links to Customer.id
  companyName: string;
  authPerson: string;
  licenseKey: string;
  sku: string;
  renewalDate: string;
  isActive: boolean;
  email: string;
  listPrice?: number;
  customerUnitPrice?: number;
  termStartDate?: string;
  termMonths?: number;
  termEndDate?: string;
  initialAuthState?: 'Active' | 'Blocked' | 'POC';
}

export interface CustomerProductMapping {
  id: string;
  customerId: number; // integer value
  productId: number; // integer value
  productSku: string; // varchar value
  productUnitPrice: number; // dollar amount
  customerUnitPrice: number; // dollar amount
}

export interface CustomerInvoiceItem {
  name: string;
  sku?: string;
  units: number;
  amount: number;
}

export interface CustomerInvoice {
  id: string;
  customerId: string;
  customerName?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  paidAmount: number;
  status: 'Raised' | 'Pending' | 'Paid' | 'Overdue';
  description: string;
  paymentMethod?: string;
  items: CustomerInvoiceItem[];
  notes?: string;
}

export interface HostActivation {
  id: string;
  contractId: string;
  contractIsActive: boolean;
  productId: string;
  productSku: string;
  customerId: string;
  customerHostId: string; // attribute from customer system (ie sysId/mac address)
  licenseKey: string; // combo of product info, customer info and customer host info used to enable product on intended customer host/s
  customerName: string;
  productName: string;
  licenseActive: boolean;
  licenseStartDate: string;
  licenseEndDate: string;
}



