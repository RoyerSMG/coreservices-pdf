export interface EncryptPDFOptions {
  ownerPassword?: string;
  algorithm?: 'AES-256' | 'RC4';
  allowPrinting?: boolean;
  allowModifying?: boolean;
  allowCopying?: boolean;
  allowAnnotating?: boolean;
  allowFillingForms?: boolean;
  allowExtraction?: boolean;
  allowAssembly?: boolean;
  allowHighQualityPrint?: boolean;
}

/**
 * Encrypt a PDF with password protection.
 *
 * @throws {AlreadyEncryptedError} if the input PDF is already encrypted.
 * @throws {PasswordEncodingError} if the password cannot be encoded for the
 *         chosen algorithm (e.g. a non-PDFDocEncoding character under RC4).
 */
export declare function encryptPDF(
  pdfBytes: Uint8Array,
  userPassword: string,
  options?: EncryptPDFOptions
): Promise<Uint8Array>;

/** Thrown when the input PDF already has an /Encrypt dictionary. */
export declare class AlreadyEncryptedError extends Error {
  readonly name: 'AlreadyEncryptedError';
  readonly code: 'ALREADY_ENCRYPTED';
}

/** Thrown when a password cannot be encoded for the target security handler. */
export declare class PasswordEncodingError extends Error {
  readonly name: 'PasswordEncodingError';
  readonly code:
    | 'UNSUPPORTED_PASSWORD_CHARACTER'
    | 'PROHIBITED_PASSWORD_CHARACTER'
    | 'UNSTABLE_PASSWORD_CHARACTER'
    | 'BIDIRECTIONAL_PASSWORD';
}

/** Encode a password as PDFDocEncoding, for the R<=4 security handler. */
export declare function encodePasswordLegacy(password: string): Uint8Array;
/** SASLprep + UTF-8, truncated to 127 bytes, for the R=6 security handler. */
export declare function encodePasswordAES256(password: string): Uint8Array;
/** Apply the SASLprep profile of stringprep (RFC 4013) to a string. */
export declare function saslPrep(password: string): string;

export declare function md5(data: Uint8Array | string): Uint8Array;
export declare class RC4 {
  constructor(key: Uint8Array);
  process(data: Uint8Array): Uint8Array;
}
export declare function hexToBytes(hex: string): Uint8Array;
export declare function bytesToHex(bytes: Uint8Array): string;

export declare function sha256(data: Uint8Array): Promise<Uint8Array>;
export declare function sha384(data: Uint8Array): Promise<Uint8Array>;
export declare function sha512(data: Uint8Array): Promise<Uint8Array>;
export declare function aes256CbcEncrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array>;
export declare function aes256CbcEncryptNoPad(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array>;
export declare function aes256EcbEncryptBlock(block: Uint8Array, key: Uint8Array): Promise<Uint8Array>;
export declare function computeHash2B(password: Uint8Array, salt: Uint8Array, userKey: Uint8Array): Promise<Uint8Array>;
export declare function concat(...arrays: Uint8Array[]): Uint8Array;
