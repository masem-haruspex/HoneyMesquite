// receivable.ts
import type {
    CollectionStage,
    BaseEntity,
    PaymentStatus
} from "../commonTypes";

export interface Client extends BaseEntity {
    name: string;
    creditRating?: string;
    paymentTerms: number;
    lastPaymentDate?: string | null;
}

export interface AccountsReceivable extends BaseEntity {
    client: Client;
    invoiceNumber: string;
    amount: number;
    issuedDate: string;
    dueDate?: string | null;
    daysLate?: number | null;
    status?: PaymentStatus | null;
    collectionStage: CollectionStage;
    probabilityOfPayment?: number | null;
    lastReminderDate?: string | null;
}

export interface AccountsReceivableRequest {
    clientId: number;
    invoiceNumber: string;
    amount: number;
    issuedDate: string;
    dueDate?: string | null;
    daysLate?: number | null;
    status?: PaymentStatus | null;
    collectionStage: CollectionStage;
    probabilityOfPayment?: number | null;
    lastReminderDate?: string | null;
}

export interface ClientRequest {
    legalName: string;
    creditRating?: string | null;
    paymentTerms: number;
    lastPaymentDate?: string | null;
}

export interface ClientResponse extends BaseEntity {
    legalName: string;
    creditRating?: string | null;
    paymentTerms: number;
    lastPaymentDate?: string | null;
    createdAt: string;
}
