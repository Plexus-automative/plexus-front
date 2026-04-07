export interface NonTraitee {
  id: string;
  number: string;
  orderDate: string;
  vendorName: string;
  payToVendorNumber: string;
  fullyReceived: boolean;
  ShippingAdvice: string
  status: string;
  postingDate: string;
  lastModifiedDateTime: string;
  QtyReceived?: string;
  ReceivedPurchaseHeader?: string;
  plexuspurchaseOrderLines?: PurchaseOrderLine[]; // 👈 ADD THIS

}

// types/PurchaseOrderLine.ts
export interface PurchaseOrderLine {
  id: string;
  sequence: number;
  lineObjectNumber: string;
  description: string;
  quantity: number;
  directUnitCost: number;
  taxPercent: number;
  amountIncludingTax: number;
  Decision?: string;
  receiveQuantity?: number;
  QuantityAvailable?: number;
  receivedQuantity?: number;
  OldRemplacementItemNo?: string;
  DeliveryDate?: string;
  nature?: string;
}