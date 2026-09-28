// dataAtoms.ts
import { atom } from 'jotai';

export const budgetsDataAtom = atom<any[]>([]);
export const cashFlowDataAtom = atom<any[]>([]);
export const departmentsDataAtom = atom<any[]>([]);
export const profitLossDataAtom = atom<any[]>([]);
export const receivablesDataAtom = atom<any[]>([]);
export const vendorsDataAtom = atom<any[]>([]);

export const loadingAtom = atom<boolean>(true);
export const errorAtom = atom<string | null>(null);
export const retryCountAtom = atom<number>(0);

export const activePageAtom = atom<string>('company');
