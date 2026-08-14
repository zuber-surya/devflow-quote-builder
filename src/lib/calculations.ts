import { Decimal } from "@prisma/client/runtime/library";

/**
 * Calculate line total: (quantity × unitPrice) - discount
 */
export function calculateLineTotal(
  quantity: Decimal | number,
  unitPrice: Decimal | number,
  discount: Decimal | number = 0
): Decimal {
  const qty = new Decimal(quantity);
  const price = new Decimal(unitPrice);
  const disc = new Decimal(discount);
  
  return qty.times(price).minus(disc);
}

/**
 * Calculate tax amount on a line item
 */
export function calculateTaxAmount(
  lineTotal: Decimal | number,
  taxRate: Decimal | number
): Decimal {
  const total = new Decimal(lineTotal);
  const rate = new Decimal(taxRate).dividedBy(100);
  
  return total.times(rate);
}

/**
 * Calculate subtotal from line items
 */
export function calculateSubtotal(
  items: Array<{ quantity: Decimal | number; unitPrice: Decimal | number; discount?: Decimal | number }>
): Decimal {
  return items.reduce((sum, item) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice, item.discount || 0);
    return sum.plus(lineTotal);
  }, new Decimal(0));
}

/**
 * Calculate total tax from line items
 */
export function calculateTotalTax(
  items: Array<{ quantity: Decimal | number; unitPrice: Decimal | number; discount?: Decimal | number; taxRate: Decimal | number }>
): Decimal {
  return items.reduce((sum, item) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice, item.discount || 0);
    const tax = calculateTaxAmount(lineTotal, item.taxRate);
    return sum.plus(tax);
  }, new Decimal(0));
}

/**
 * Calculate grand total: subtotal + tax - discount
 */
export function calculateGrandTotal(
  subtotal: Decimal | number,
  taxAmount: Decimal | number,
  discount: Decimal | number = 0
): Decimal {
  const sub = new Decimal(subtotal);
  const tax = new Decimal(taxAmount);
  const disc = new Decimal(discount);
  
  return sub.plus(tax).minus(disc);
}

/**
 * Validate quote/invoice item data
 */
export interface LineItemData {
  quantity: Decimal | number;
  unitPrice: Decimal | number;
  discount?: Decimal | number;
  taxRate: Decimal | number;
}

export function validateLineItem(item: LineItemData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const quantity = new Decimal(item.quantity);
  const unitPrice = new Decimal(item.unitPrice);
  const taxRate = new Decimal(item.taxRate);

  if (quantity.isNegative() || quantity.isZero()) {
    errors.push("Quantity must be greater than 0");
  }

  if (unitPrice.isNegative() || unitPrice.isZero()) {
    errors.push("Unit price must be greater than 0");
  }

  if (taxRate.isNegative()) {
    errors.push("Tax rate cannot be negative");
  }

  if (taxRate.isGreaterThan(100)) {
    errors.push("Tax rate cannot exceed 100%");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format currency (INR by default)
 */
export function formatCurrency(
  amount: Decimal | number | string,
  currency: string = "INR"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(num);
}

/**
 * Generate quote/invoice number
 * Format: Q-2026-00001 or INV-2026-00001
 */
export function generateDocumentNumber(
  type: "quote" | "invoice",
  sequenceNumber: number,
  year: number = new Date().getFullYear()
): string {
  const prefix = type === "quote" ? "Q" : "INV";
  const paddedNumber = sequenceNumber.toString().padStart(5, "0");
  return `${prefix}-${year}-${paddedNumber}`;
}

/**
 * Calculate payment status based on paid amount
 */
export function calculatePaymentStatus(
  total: Decimal | number,
  paidAmount: Decimal | number
): "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" {
  const t = new Decimal(total);
  const p = new Decimal(paidAmount);

  if (p.isZero()) return "UNPAID";
  if (p.equals(t)) return "PAID";
  if (p.isGreaterThan(0) && p.isLessThan(t)) return "PARTIALLY_PAID";
  
  return "UNPAID";
}

/**
 * Check if quote/invoice is overdue
 */
export function isOverdue(dueDate: Date | string): boolean {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return due < new Date();
}

/**
 * Round decimal to 2 places (for display)
 */
export function roundToTwoDecimals(value: Decimal | number): string {
  const dec = new Decimal(value);
  return dec.toDecimalPlaces(2).toString();
}
