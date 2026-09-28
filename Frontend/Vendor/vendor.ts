// vendor.ts
import type { BaseEntity } from "../commonTypes";

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'DISPUTED';

export interface Vendor extends BaseEntity {
  legalName: string;
  industryClassification?: string;
  marketRateReference?: string;
}

export interface VendorContract extends BaseEntity {
  vendorId: number;
  departmentId?: number | null;
  serviceDescription: string;
  contractedRate: string; 
  marketComparisonRate?: string | null; 
  variancePercentage?: number | null;
  contractStart: string; 
  contractEnd: string; 
  autoRenew: boolean;
  paymentTerms?: string | null;
  isActive: boolean;
}

export interface VendorInvoice extends BaseEntity {
  contractId: number;
  invoiceDate: string; 
  amount: string; 
  paymentStatus: PaymentStatus;
  marketRateAtPayment?: string | null; 
}

export interface VendorContractVariance {
  contractId: number;
  vendorId: number;
  serviceDescription: string;
  contractedRate: string;
  marketRate: string;
  varianceAmount: string;
  variancePercentage: number;
}

export interface CreateVendorRequest {
  legalName: string;
  industryClassification?: string;
  marketRateReference?: string;
}

export interface CreateVendorContractRequest {
  vendorId: number;
  departmentId?: number | null;
  serviceDescription: string;
  contractedRate: string;
  marketComparisonRate?: string | null;
  contractStart: string;
  contractEnd: string;
  autoRenew: boolean;
}

export interface CreateVendorInvoiceRequest {
  contractId: number;
  invoiceDate: string;
  amount: string;
  paymentStatus: PaymentStatus;
  marketRateAtPayment?: string | null;
}

export interface VendorResponse extends Vendor {}
export interface VendorContractResponse extends VendorContract {}
export interface VendorInvoiceResponse extends VendorInvoice {}
export interface VendorContractVarianceResponse extends VendorContractVariance {}
