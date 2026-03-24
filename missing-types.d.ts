// Type declarations for packages that are listed in package.json but whose
// type definitions are not yet installed in node_modules.

// ── Jest globals (@types/jest) ────────────────────────────────────────
// Minimal declarations so test files compile under tsc --noEmit.

interface JestMockFn<T extends (...args: never[]) => unknown = (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>;
  mockReturnValue(val: ReturnType<T>): this;
  mockReturnValueOnce(val: ReturnType<T>): this;
  mockResolvedValue(val: Awaited<ReturnType<T>>): this;
  mockResolvedValueOnce(val: Awaited<ReturnType<T>>): this;
  mockRejectedValue(val: unknown): this;
  mockRejectedValueOnce(val: unknown): this;
  mockImplementation(fn: T): this;
  mockImplementationOnce(fn: T): this;
  mockClear(): this;
  mockReset(): this;
  mockRestore(): this;
  mock: {
    calls: Parameters<T>[];
    results: Array<{ type: string; value: ReturnType<T> }>;
    instances: unknown[];
  };
}

interface JestMatchers<T> {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toBeNaN(): void;
  toBeGreaterThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toBeCloseTo(expected: number, numDigits?: number): void;
  toBeInstanceOf(expected: unknown): void;
  toContain(expected: unknown): void;
  toContainEqual(expected: unknown): void;
  toHaveLength(expected: number): void;
  toHaveProperty(path: string | string[], value?: unknown): void;
  toMatch(expected: string | RegExp): void;
  toMatchObject(expected: object): void;
  toThrow(expected?: string | RegExp | Error): void;
  toThrowError(expected?: string | RegExp | Error): void;
  toHaveBeenCalled(): void;
  toHaveBeenCalledTimes(expected: number): void;
  toHaveBeenCalledWith(...args: unknown[]): void;
  toHaveBeenLastCalledWith(...args: unknown[]): void;
  toHaveBeenNthCalledWith(n: number, ...args: unknown[]): void;
  toHaveReturned(): void;
  toHaveReturnedTimes(expected: number): void;
  toHaveReturnedWith(expected: unknown): void;
  resolves: JestMatchers<Promise<T>>;
  rejects: JestMatchers<Promise<T>>;
  not: JestMatchers<T>;
}

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
declare function test(name: string, fn: () => void | Promise<void>, timeout?: number): void;
declare function expect<T>(actual: T): JestMatchers<T>;
declare namespace expect {
  function objectContaining(obj: object): unknown;
  function arrayContaining(arr: unknown[]): unknown;
  function stringContaining(str: string): unknown;
  function stringMatching(pattern: string | RegExp): unknown;
  function any(classType: unknown): unknown;
  function anything(): unknown;
}
declare function beforeAll(fn: () => void | Promise<void>, timeout?: number): void;
declare function afterAll(fn: () => void | Promise<void>, timeout?: number): void;
declare function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
declare function afterEach(fn: () => void | Promise<void>, timeout?: number): void;

declare namespace jest {
  type Mocked<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
      ? JestMockFn<(...args: A) => R>
      : T[K];
  };
  function fn<T extends (...args: never[]) => unknown = (...args: unknown[]) => unknown>(implementation?: T): JestMockFn<T>;
  function mock(moduleName: string, factory?: () => unknown, options?: object): void;
  function unmock(moduleName: string): void;
  function spyOn<T extends object, M extends keyof T>(object: T, method: M): JestMockFn;
  function useFakeTimers(): void;
  function useRealTimers(): void;
  function advanceTimersByTime(ms: number): void;
  function runAllTimers(): void;
  function runOnlyPendingTimers(): void;
  function clearAllMocks(): void;
  function resetAllMocks(): void;
  function restoreAllMocks(): void;
  function clearAllTimers(): void;
  function requireActual<T = unknown>(moduleName: string): T;
}

// ── jest module (for jest.config.ts import) ──────────────────────────
declare module "jest" {
  interface Config {
    testEnvironment?: string;
    transform?: Record<string, string | [string, object]>;
    transformIgnorePatterns?: string[];
    moduleNameMapper?: Record<string, string>;
    moduleFileExtensions?: string[];
    collectCoverageFrom?: string[];
    coverageThreshold?: Record<string, Record<string, number>>;
    setupFiles?: string[];
    setupFilesAfterFramework?: string[];
    preset?: string;
    [key: string]: unknown;
  }
}

// ── zod (v4) ──────────────────────────────────────────────────────────
declare module "zod" {
  export interface ZodIssue {
    path: (string | number)[];
    message: string;
    code: string;
  }

  export interface ZodError {
    issues: ZodIssue[];
  }

  export interface ZodSafeParseSuccess<T> {
    success: true;
    data: T;
  }

  export interface ZodSafeParseError {
    success: false;
    error: ZodError;
  }

  export type ZodSafeParseResult<T> = ZodSafeParseSuccess<T> | ZodSafeParseError;

  export interface RefinementCtx {
    addIssue(issue: { code: string; message: string; path?: (string | number)[] }): void;
  }

  export interface ZodType<T = unknown> {
    parse(data: unknown): T;
    safeParse(data: unknown): ZodSafeParseResult<T>;
    optional(): ZodType<T | undefined>;
    nullable(): ZodType<T | null>;
    refine(check: (val: T) => boolean, messageOrOpts?: string | { message: string; path?: string[] }): ZodType<T>;
    superRefine(refinement: (val: T, ctx: RefinementCtx) => void): ZodType<T>;
    transform<U>(fn: (val: T) => U): ZodType<U>;
    pipe<U>(schema: ZodType<U>): ZodType<U>;
  }

  export interface ZodString extends ZodType<string> {
    min(len: number, message?: string): ZodString;
    max(len: number, message?: string): ZodString;
    email(message?: string): ZodString;
    regex(re: RegExp, message?: string): ZodString;
    trim(): ZodString;
    toLowerCase(): ZodString;
    toUpperCase(): ZodString;
    optional(): ZodType<string | undefined>;
    refine(check: (val: string) => boolean, messageOrOpts?: string | { message: string; path?: string[] }): ZodString;
    superRefine(refinement: (val: string, ctx: RefinementCtx) => void): ZodString;
    transform<U>(fn: (val: string) => U): ZodType<U>;
    pipe<U>(schema: ZodType<U>): ZodType<U>;
  }

  export interface ZodNumber extends ZodType<number> {
    min(val: number, message?: string): ZodNumber;
    max(val: number, message?: string): ZodNumber;
    int(message?: string): ZodNumber;
    positive(message?: string): ZodNumber;
    nonnegative(message?: string): ZodNumber;
  }

  export interface ZodBoolean extends ZodType<boolean> {}

  export interface ZodObject<T extends Record<string, ZodType> = Record<string, ZodType>> extends ZodType<{ [K in keyof T]: T[K] extends ZodType<infer U> ? U : never }> {
    shape: T;
    refine(check: (val: { [K in keyof T]: T[K] extends ZodType<infer U> ? U : never }) => boolean, messageOrOpts?: string | { message: string; path?: string[] }): ZodType<{ [K in keyof T]: T[K] extends ZodType<infer U> ? U : never }>;
  }

  export interface ZodEnum<T extends [string, ...string[]]> extends ZodType<T[number]> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export const ZodIssueCode: {
    custom: string;
    invalid_type: string;
    too_small: string;
    too_big: string;
    invalid_string: string;
    [key: string]: string;
  };

  type InferZodType<T> = T extends ZodType<infer U> ? U : never;

  export const z: {
    string: (params?: { message?: string }) => ZodString;
    number: (params?: { message?: string }) => ZodNumber;
    boolean: () => ZodBoolean;
    object: <T extends Record<string, ZodType>>(shape: T) => ZodObject<T>;
    enum: <T extends [string, ...string[]]>(values: T) => ZodEnum<T>;
    literal: <T extends string | number | boolean>(value: T) => ZodType<T>;
    union: <T extends [ZodType, ZodType, ...ZodType[]]>(types: T) => ZodType;
    array: <T extends ZodType>(schema: T) => ZodType<Array<InferZodType<T>>>;
    optional: <T extends ZodType>(schema: T) => ZodType;
    infer: never;
    ZodIssueCode: {
      custom: string;
      invalid_type: string;
      too_small: string;
      too_big: string;
      invalid_string: string;
      [key: string]: string;
    };
  };

  export namespace z {
    type infer<T extends ZodType> = T extends ZodType<infer U> ? U : never;
  }

  export { z as default };
}

// ── @react-native-community/netinfo ───────────────────────────────────
declare module "@react-native-community/netinfo" {
  export interface NetInfoState {
    type: string;
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    details: unknown;
  }

  export type NetInfoChangeHandler = (state: NetInfoState) => void;

  interface NetInfo {
    addEventListener(listener: NetInfoChangeHandler): () => void;
    fetch(): Promise<NetInfoState>;
    refresh(): Promise<NetInfoState>;
  }

  const netInfo: NetInfo;
  export default netInfo;
}

// ── react-native-qrcode-svg ──────────────────────────────────────────
declare module "react-native-qrcode-svg" {
  import { Component } from "react";

  interface QRCodeProps {
    value?: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    logo?: object;
    logoSize?: number;
    logoMargin?: number;
    logoBorderRadius?: number;
    logoBackgroundColor?: string;
    enableLinearGradient?: boolean;
    gradientDirection?: string[];
    linearGradient?: string[];
    ecl?: "L" | "M" | "Q" | "H";
    getRef?: (ref: unknown) => void;
    quietZone?: number;
  }

  export default class QRCode extends Component<QRCodeProps> {}
}
