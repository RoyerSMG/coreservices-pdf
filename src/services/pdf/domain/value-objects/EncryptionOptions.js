/**
 * Value Object for PDF encryption options.
 * Immutable object containing encryption configuration.
 */

export class EncryptionOptions {
  /**
   * @param {Object} options
   * @param {string} options.userPassword - Password required to open the document (empty = no user password)
   * @param {string} options.ownerPassword - Password required to change permissions
   * @param {Object} options.permissions - PDF permission flags
   * @param {boolean} options.permissions.modify - Allow content modification
   * @param {boolean} options.permissions.copy - Allow copying content
   * @param {boolean} options.permissions.print - Allow printing
   * @param {boolean} options.permissions.printHighQuality - Allow high-quality printing
   * @param {boolean} options.permissions.annotate - Allow annotations
   * @param {boolean} options.permissions.fillForms - Allow filling forms
   * @param {boolean} options.permissions.extract - Allow content extraction
   * @param {boolean} options.permissions.assemble - Allow page assembly
   */

  constructor({ userPassword = '', ownerPassword, permissions }) {
    if (!ownerPassword || ownerPassword.length < 4) {
      throw new Error('Owner password must be at least 4 characters');
    }

    // Default permissions per RF-4: no modify, no copy, print allowed, high-quality print allowed
    this._userPassword = userPassword;
    this._ownerPassword = ownerPassword;
    this._permissions = Object.freeze({
      modify: false,
      copy: false,
      print: true,
      printHighQuality: true,
      annotate: false,
      fillForms: false,
      extract: false,
      assemble: false,
      ...permissions,
    });
  }

  get userPassword() {
    return this._userPassword;
  }

  get ownerPassword() {
    return this._ownerPassword;
  }

  get permissions() {
    return this._permissions;
  }

  /**
   * Creates EncryptionOptions from a plain password string.
   * Uses the password as owner password, no user password.
   * @param {string} password
   * @returns {EncryptionOptions}
   */
  static fromPassword(password) {
    return new EncryptionOptions({ ownerPassword: password });
  }

  /**
   * Returns a plain object representation (for serialization).
   * @returns {Object}
   */
  toJSON() {
    return {
      userPassword: this._userPassword,
      ownerPassword: this._ownerPassword,
      permissions: { ...this._permissions },
    };
  }
}