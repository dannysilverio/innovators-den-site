export const SITE_ORIGIN: string;
export const LEGACY_ORIGIN: string;
export const REDIRECT_HOSTS: string[];
export function siteUrl(path?: string): string;
export function articleUrl(id: string, title?: string): string;
export function normalizeSiteMetadata<T>(value: T): T;
export function domainRedirect(host?: string, requestPath?: string): string | null;
export function isAllowedOrigin(origin?: string, development?: boolean): boolean;
export function resolveApiOrigin(value?: string): string;
