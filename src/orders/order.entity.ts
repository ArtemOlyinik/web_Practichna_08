export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxAmount: number;
  totalWithTax: number;
  createdAt: Date;
}
