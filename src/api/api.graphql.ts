
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum AuthUserType {
    ADMIN = "ADMIN",
    USER = "USER"
}

export interface CreateAdminInput {
    exampleField?: Nullable<number>;
}

export interface UpdateAdminInput {
    id: number;
}

export interface CreatePermissionInput {
    exampleField?: Nullable<number>;
}

export interface UpdatePermissionInput {
    id: number;
}

export interface CreateUserInput {
    exampleField?: Nullable<number>;
}

export interface UpdateUserInput {
    id: number;
}

export interface Admin {
    exampleField?: Nullable<number>;
}

export interface IQuery {
    admin(id: number): Nullable<Admin> | Promise<Nullable<Admin>>;
    auth(id: number): Nullable<Auth> | Promise<Nullable<Auth>>;
    permission(id: number): Nullable<Permission> | Promise<Nullable<Permission>>;
    user(id: number): Nullable<User> | Promise<Nullable<User>>;
}

export interface IMutation {
    createAdmin(createAdminInput: CreateAdminInput): Admin | Promise<Admin>;
    updateAdmin(updateAdminInput: UpdateAdminInput): Admin | Promise<Admin>;
    removeAdmin(id: number): Nullable<Admin> | Promise<Nullable<Admin>>;
    info(): Auth | Promise<Auth>;
    loginWithEmail(email: string, password: string, type?: Nullable<AuthUserType>): AuthTokenInfo | Promise<AuthTokenInfo>;
    logout(id?: Nullable<string>): boolean | Promise<boolean>;
    refreshToken(): AuthTokenInfo | Promise<AuthTokenInfo>;
    forgotPassword(email: string, type?: Nullable<AuthUserType>): boolean | Promise<boolean>;
    resetPassword(token: string, password: string): Auth | Promise<Auth>;
    verifyEmail(token: string): boolean | Promise<boolean>;
    resendVerificationEmail(): boolean | Promise<boolean>;
    createPermission(createPermissionInput: CreatePermissionInput): Permission | Promise<Permission>;
    updatePermission(updatePermissionInput: UpdatePermissionInput): Permission | Promise<Permission>;
    removePermission(id: number): Nullable<Permission> | Promise<Nullable<Permission>>;
    createUser(createUserInput: CreateUserInput): User | Promise<User>;
    updateUser(updateUserInput: UpdateUserInput): User | Promise<User>;
    removeUser(id: number): Nullable<User> | Promise<Nullable<User>>;
}

export interface Auth {
    userId?: Nullable<number>;
    userType: AuthUserType;
    email: string;
    fullName: string;
}

export interface AuthTokenInfo {
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
    tokenType: string;
}

export interface Permission {
    exampleField?: Nullable<number>;
}

export interface User {
    exampleField?: Nullable<number>;
}

type Nullable<T> = T | null;
