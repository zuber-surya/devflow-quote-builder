// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  // For web (sessions)
  sessionToken?: string;
  // For mobile (JWT)
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// ============================================================================
// User Types
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Business Profile Types
// ============================================================================

export interface BusinessProfileRequest {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxNumber?: string;
  currency?: string;
  primaryAccentColor?: string;
  defaultFooterNote?: string;
}

export interface BusinessProfile extends BusinessProfileRequest {
  id: string;
  logoUrl?: string;
  logoUploadedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Customer Types
// ============================================================================

export interface CustomerRequest {
  customerName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxNumber?: string;
  notes?: string;
}

export interface Customer extends CustomerRequest {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Product Types
// ============================================================================

export interface ProductRequest {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  taxRate?: number;
  unit?: string;
}

export interface Product extends ProductRequest {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Quote Types
// ============================================================================

export interface QuoteItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate: number;
}

export interface QuoteRequest {
  customerId: string;
  items: QuoteItemRequest[];
  expiresAt?: Date;
  discount?: number;
  discountPercentage?: number;
  notes?: string;
  termsAndConditions?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED";
  issuedAt: Date;
  expiresAt?: Date;
  subtotal: number;
  taxAmount: number;
  total: number;
  discount?: number;
  discountPercentage?: number;
  notes?: string;
  termsAndConditions?: string;
  convertedToInvoiceId?: string;
  convertedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: QuoteItem[];
  customer?: Customer;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
}

// ============================================================================
// Invoice Types
// ============================================================================

export interface InvoiceItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate: number;
}

export interface InvoiceRequest {
  customerId: string;
  quoteId?: string; // If converting from quote
  items: InvoiceItemRequest[];
  dueAt: Date;
  discount?: number;
  discountPercentage?: number;
  notes?: string;
  termsAndConditions?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  quoteId?: string;
  issuedAt: Date;
  dueAt: Date;
  subtotal: number;
  taxAmount: number;
  total: number;
  discount?: number;
  discountPercentage?: number;
  paidAmount: number;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  notes?: string;
  termsAndConditions?: string;
  markedPaidAt?: Date;
  markedPaidBy?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: InvoiceItem[];
  customer?: Customer;
  sourceQuote?: Quote;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
}

// ============================================================================
// PDF Generation Types
// ============================================================================

export interface PdfGenerationRequest {
  type: "quote" | "invoice";
  documentId: string;
  fileName?: string;
}

export interface PdfGenerationResponse {
  success: boolean;
  fileName: string;
  downloadUrl: string;
}
