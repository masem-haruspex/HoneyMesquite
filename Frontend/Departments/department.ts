import type { BaseEntity } from "../commonTypes";

export interface Department extends BaseEntity {
    name: string;
    headcount: number;
    currentEfficiency: number;
    currentBudget: number;
    fiscalYear: number;
    latitude?: number;
    longitude?: number;
}

export interface DepartmentPerformance extends BaseEntity {
    departmentId: number;
    department?: {
        id: number;
        name: string;
        headcount: number;
    };
    recordedDate: string;
    spend: number;
    revenue: number;
    efficiency: number;
    isCurrent: boolean;
}

export interface DepartmentRequest {
    name: string;
    headcount: number;
    currentEfficiency: number;
    currentBudget: number;
    fiscalYear: number;
    latitude?: number;
    longitude?: number;
}

export interface DepartmentPerformanceRequest {
    departmentId: number;
    recordedDate: string;
    spend: number;
    revenue: number;
    efficiency: number;
    isCurrent: boolean;
}
