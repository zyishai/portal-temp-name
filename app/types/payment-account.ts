import { DateTimeString, EntityBase } from "./misc";
import { Contact, Student } from "./student";
import { Teacher } from "./teacher";

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BIT = 'BIT',
  PAYPAL = 'PAYPAL'
}

export type Payment = {
  id: string;
  type: TransactionType.CREDIT,
  sum: number;
  method: PaymentMethod;
  student: string | Student;
  contact: string | Contact;
  paidAt: DateTimeString;
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export type Transaction = {
  id: string;
  type: TransactionType.CREDIT;
  sum: number;
  method: PaymentMethod;
  paidAt: DateTimeString;
} | {
  id: string;
  type: TransactionType.DEBIT;
  sum: number;
  date: DateTimeString;
};

export type PaymentAccount = EntityBase & {
  balance: number;
  transactions: readonly Transaction[];
  payments: Payment[];
  students: string[] | Student[];
  contacts: string[] | Contact[];
  teacher: string | Teacher;
}
