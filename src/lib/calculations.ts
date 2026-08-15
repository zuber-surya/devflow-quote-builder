import { Decimal } from "@prisma/client/runtime/library";

/**
 * Round to the given number of decimal places, returning a Decimal (not a
 * string) so the result stays usable in further math. Line totals and tax
 * are rounded at 2dp to match the NUMERIC(14,2) columns they're persisted
 * into - rounding each line before summing (rather than summing full
 * precision then rounding once) is what keeps a persisted line total and
 * the persisted subtotal from disagreeing by a cent.
 */
export function quantize(value: Decimal | number, decimalPlaces = 2): Decimal {
  return new Decimal(value).toDecimalPlaces(decimalPlaces);
}

/**
 * Calculate line total: (quantity × unitPrice) - discount, floored at 0
 * and rounded to 2dp. A discount larger than the line's own subtotal
 * cannot drive it negative - validateLineItem should reject that upstream,
 * but this floor is the last line of defense since calculateLineTotal is
 * independently callable without going through validation first.
 */
export function calculateLineTotal(
  quantity: Decimal | number,
  unitPrice: Decimal | number,
  discount: Decimal | number = 0
): Decimal {
  const qty = new Decimal(quantity);
  const price = new Decimal(unitPrice);
  const disc = new Decimal(discount);

  const raw = qty.times(price).minus(disc);
  return quantize(Decimal.max(raw, 0));
}

/**
 * Calculate tax amount on a line item, rounded to 2dp.
 */
export function calculateTaxAmount(
  lineTotal: Decimal | number,
  taxRate: Decimal | number
): Decimal {
  const total = new Decimal(lineTotal);
  const rate = new Decimal(taxRate).dividedBy(100);

  return quantize(total.times(rate));
}

/**
 * Calculate subtotal from line items. Sums already-rounded line totals
 * (see calculateLineTotal), so no re-rounding is needed here.
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
 * Calculate total tax from line items. Sums already-rounded per-line tax.
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
 * Calculate grand total: subtotal + tax - discount, floored at 0 and
 * rounded to 2dp. `discount` here is the document-level discount, applied
 * on top of whatever was already subtracted per-line into subtotal - not
 * the same discount as calculateLineTotal's - do not double-apply.
 */
export function calculateGrandTotal(
  subtotal: Decimal | number,
  taxAmount: Decimal | number,
  discount: Decimal | number = 0
): Decimal {
  const sub = new Decimal(subtotal);
  const tax = new Decimal(taxAmount);
  const disc = new Decimal(discount);

  const raw = sub.plus(tax).minus(disc);
  return quantize(Decimal.max(raw, 0));
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
  const discount = new Decimal(item.discount || 0);

  if (quantity.isNegative() || quantity.isZero()) {
    errors.push("Quantity must be greater than 0");
  }

  if (unitPrice.isNegative() || unitPrice.isZero()) {
    errors.push("Unit price must be greater than 0");
  }

  if (taxRate.isNegative()) {
    errors.push("Tax rate cannot be negative");
  }

  if (taxRate.greaterThan(100)) {
    errors.push("Tax rate cannot exceed 100%");
  }

  if (discount.isNegative()) {
    errors.push("Discount cannot be negative");
  }

  if (discount.greaterThan(quantity.times(unitPrice))) {
    errors.push("Discount cannot exceed the line's own subtotal");
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
 * Calculate payment status from amounts alone (no due date). PAID is
 * paidAmount >= total, per business-rules.md - not just equality, so an
 * overpayment is still reported as PAID rather than falling through to
 * UNPAID.
 */
export function calculatePaymentStatus(
  total: Decimal | number,
  paidAmount: Decimal | number
): "UNPAID" | "PARTIALLY_PAID" | "PAID" {
  const t = new Decimal(total);
  const p = new Decimal(paidAmount);

  if (p.greaterThanOrEqualTo(t)) return "PAID";
  if (p.greaterThan(0)) return "PARTIALLY_PAID";
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
 * Full payment status including OVERDUE, per business-rules.md: "Overdue"
 * overlays Unpaid/Partially Paid (past due AND not fully paid) - it is
 * never applied to an invoice that's already PAID, even if paid late.
 */
export function derivePaymentStatus(
  total: Decimal | number,
  paidAmount: Decimal | number,
  dueAt: Date | string
): "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" {
  const baseStatus = calculatePaymentStatus(total, paidAmount);
  if (baseStatus === "PAID") return "PAID";
  return isOverdue(dueAt) ? "OVERDUE" : baseStatus;
}

/**
 * Round decimal to 2 places (for display)
 */
export function roundToTwoDecimals(value: Decimal | number): string {
  return quantize(value).toString();
}
