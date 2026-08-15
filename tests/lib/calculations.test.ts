import { describe, it, expect } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import {
  calculateLineTotal,
  calculateTaxAmount,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  validateLineItem,
  calculatePaymentStatus,
  derivePaymentStatus,
  isOverdue,
  quantize,
} from "@/lib/calculations";

describe("calculateLineTotal", () => {
  it("computes quantity * unitPrice - discount", () => {
    expect(calculateLineTotal(2, 10, 3).toString()).toBe("17");
  });

  it("100% discount lands exactly on zero", () => {
    expect(calculateLineTotal(1, 50, 50).toString()).toBe("0");
  });

  it("discount exceeding the line subtotal floors at zero, never negative", () => {
    expect(calculateLineTotal(1, 10, 15).toString()).toBe("0");
  });

  it("rounds to 2 decimal places", () => {
    // 1.3333 * 10.01 = 13.3453... -> rounds to 13.35
    expect(calculateLineTotal(1.3333, 10.01, 0).toString()).toBe("13.35");
  });
});

describe("calculateTaxAmount", () => {
  it("computes tax as a percentage of the line total, rounded to 2dp", () => {
    expect(calculateTaxAmount(100, 18).toString()).toBe("18");
  });
});

describe("calculateSubtotal / calculateTotalTax - rounding consistency", () => {
  it("sums already-rounded per-line totals (no drift vs summing full precision)", () => {
    const items = [
      { quantity: 1.3333, unitPrice: 10.01 },
      { quantity: 1.3333, unitPrice: 10.01 },
      { quantity: 1.3333, unitPrice: 10.01 },
    ];
    // Each line rounds to 13.35 (see above), so the subtotal must be
    // exactly 3 * 13.35 = 40.05, not round(3 * 13.3453...) = 40.04.
    expect(calculateSubtotal(items).toString()).toBe("40.05");
  });

  it("empty line-item list returns zero", () => {
    expect(calculateSubtotal([]).toString()).toBe("0");
    expect(calculateTotalTax([]).toString()).toBe("0");
  });
});

describe("calculateGrandTotal", () => {
  it("subtotal + tax - discount", () => {
    expect(calculateGrandTotal(100, 18, 10).toString()).toBe("108");
  });

  it("document-level discount exceeding subtotal+tax floors at zero", () => {
    expect(calculateGrandTotal(100, 18, 200).toString()).toBe("0");
  });
});

describe("validateLineItem", () => {
  it("rejects zero quantity", () => {
    const result = validateLineItem({ quantity: 0, unitPrice: 10, taxRate: 18 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Quantity must be greater than 0");
  });

  it("rejects negative quantity", () => {
    const result = validateLineItem({ quantity: -1, unitPrice: 10, taxRate: 18 });
    expect(result.valid).toBe(false);
  });

  it("rejects tax rate over 100", () => {
    const result = validateLineItem({ quantity: 1, unitPrice: 10, taxRate: 150 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Tax rate cannot exceed 100%");
  });

  it("rejects negative discount", () => {
    const result = validateLineItem({ quantity: 1, unitPrice: 10, taxRate: 18, discount: -5 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Discount cannot be negative");
  });

  it("rejects a discount larger than the line's own subtotal", () => {
    const result = validateLineItem({ quantity: 1, unitPrice: 10, taxRate: 18, discount: 15 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Discount cannot exceed the line's own subtotal");
  });

  it("accepts a valid line item", () => {
    const result = validateLineItem({ quantity: 2, unitPrice: 10, taxRate: 18, discount: 5 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("calculatePaymentStatus", () => {
  it("zero paid is UNPAID", () => {
    expect(calculatePaymentStatus(100, 0)).toBe("UNPAID");
  });

  it("partial payment is PARTIALLY_PAID", () => {
    expect(calculatePaymentStatus(100, 40)).toBe("PARTIALLY_PAID");
  });

  it("exact payment is PAID", () => {
    expect(calculatePaymentStatus(100, 100)).toBe("PAID");
  });

  it("overpayment is still PAID, not UNPAID", () => {
    expect(calculatePaymentStatus(100, 150)).toBe("PAID");
  });
});

describe("derivePaymentStatus", () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  it("unpaid + past due = OVERDUE", () => {
    expect(derivePaymentStatus(100, 0, yesterday)).toBe("OVERDUE");
  });

  it("partially paid + past due = OVERDUE", () => {
    expect(derivePaymentStatus(100, 40, yesterday)).toBe("OVERDUE");
  });

  it("fully paid + past due is still PAID, never OVERDUE", () => {
    expect(derivePaymentStatus(100, 100, yesterday)).toBe("PAID");
  });

  it("overpaid + past due is still PAID", () => {
    expect(derivePaymentStatus(100, 150, yesterday)).toBe("PAID");
  });

  it("unpaid + not yet due = UNPAID", () => {
    expect(derivePaymentStatus(100, 0, tomorrow)).toBe("UNPAID");
  });
});

describe("isOverdue", () => {
  it("true for a past date", () => {
    expect(isOverdue(new Date(Date.now() - 1000))).toBe(true);
  });

  it("false for a future date", () => {
    expect(isOverdue(new Date(Date.now() + 1000))).toBe(false);
  });
});

describe("quantize", () => {
  it("returns a Decimal, not a string, usable in further math", () => {
    const result = quantize(1.005, 2);
    expect(result).toBeInstanceOf(Decimal);
  });

  it("rounds to the given number of places", () => {
    expect(quantize(13.34563, 2).toString()).toBe("13.35");
  });
});
