export interface Encours {
  id: string;
  number: string;
  orderDate: string;
  vendorName: string;
  payToVendorNumber: string;
  fullyReceived: boolean;
  status: string;
  ReceivedPurchaseHeader?: string;
  QtyReceived?: string;
  postingDate: string;
  lastModifiedDateTime: string;
  plexuspurchaseOrderLines?: PurchaseOrderLine[];
  ShippingAdvice?: string;
  invoiceQuantity?: number;

}
export interface PurchaseOrderLine {
  id: string;
  sequence: number;
  lineObjectNumber: string;
  description: string;
  quantity: number;
  directUnitCost: number;
  taxPercent: number;
  amountIncludingTax: number;
  expectedReceiptDate: string;
  Decision: string;
  receiveQuantity?: number;
  OldUnitPrice?: number;
  QuantityAvailable?: number;
  receivedQuantity?: number;
  OldRemplacementItemNo?: string;
  DeliveryDate?: string;
  invoiceQuantity?: number;
  nature?: string;
}