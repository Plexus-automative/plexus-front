export interface TraiteeLine {
  id: string;
  lineObjectNumber: string;
  description: string;
  quantity: number;
  directUnitCost: number;
  receivedQuantity?: number;
  receiveQuantity?: number;
  Decision?: string;
  expectedReceiptDate?: string;
}

export interface Traitee {
  id?: string;
  number: string;
  orderDate: string;
  vendorName: string;
  payToVendorNumber: string;
  fullyReceived: boolean;
  status: string;
  ShippingAdvice?: string;
  lastModifiedDateTime: string;
  plexuspurchaseOrderLines?: TraiteeLine[];
}
