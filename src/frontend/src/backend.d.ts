import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WikiPage {
    id: bigint;
    title: string;
    body: string;
    createdAt: bigint;
    tags: Array<string>;
    updatedAt: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPage(title: string, body: string, tags: Array<string>): Promise<bigint>;
    deletePage(id: bigint): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    getPage(id: bigint): Promise<WikiPage | null>;
    getPageByTitle(title: string): Promise<WikiPage | null>;
    getPagesByTag(tag: string): Promise<Array<WikiPage>>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listPages(): Promise<Array<WikiPage>>;
    updatePage(id: bigint, title: string, body: string, tags: Array<string>): Promise<boolean>;
}
