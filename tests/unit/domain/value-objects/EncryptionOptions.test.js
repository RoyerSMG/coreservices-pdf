/**
 * Unit tests for EncryptionOptions value object
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EncryptionOptions } from '../../../../src/services/pdf/domain/value-objects/EncryptionOptions.js';

describe('EncryptionOptions', () => {
  describe('constructor', () => {
    it('should create with valid owner password (>=4 chars)', () => {
      const options = new EncryptionOptions({ ownerPassword: 'secret123' });
      assert.strictEqual(options.ownerPassword, 'secret123');
      assert.strictEqual(options.userPassword, '');
    });

    it('should create with user password', () => {
      const options = new EncryptionOptions({
        userPassword: 'user123',
        ownerPassword: 'owner123',
      });
      assert.strictEqual(options.userPassword, 'user123');
      assert.strictEqual(options.ownerPassword, 'owner123');
    });

    it('should apply default permissions (RF-4)', () => {
      const options = new EncryptionOptions({ ownerPassword: 'secret123' });
      assert.strictEqual(options.permissions.modify, false);
      assert.strictEqual(options.permissions.copy, false);
      assert.strictEqual(options.permissions.print, true);
      assert.strictEqual(options.permissions.printHighQuality, true);
      assert.strictEqual(options.permissions.annotate, false);
      assert.strictEqual(options.permissions.fillForms, false);
      assert.strictEqual(options.permissions.extract, false);
      assert.strictEqual(options.permissions.assemble, false);
    });

    it('should allow custom permissions override', () => {
      const options = new EncryptionOptions({
        ownerPassword: 'secret123',
        permissions: { modify: true, copy: true },
      });
      assert.strictEqual(options.permissions.modify, true);
      assert.strictEqual(options.permissions.copy, true);
      assert.strictEqual(options.permissions.print, true); // default preserved
    });

    it('should throw if owner password missing', () => {
      assert.throws(
        () => new EncryptionOptions({ ownerPassword: '' }),
        { message: /at least 4 characters/ }
      );
    });

    it('should throw if owner password too short', () => {
      assert.throws(
        () => new EncryptionOptions({ ownerPassword: '123' }),
        { message: /at least 4 characters/ }
      );
    });

    it('should throw if owner password undefined', () => {
      assert.throws(
        () => new EncryptionOptions({}),
        { message: /at least 4 characters/ }
      );
    });
  });

  describe('fromPassword static factory', () => {
    it('should create options from password string', () => {
      const options = EncryptionOptions.fromPassword('mypassword');
      assert.strictEqual(options.ownerPassword, 'mypassword');
      assert.strictEqual(options.userPassword, '');
    });
  });

  describe('immutability', () => {
    it('should not allow modifying permissions', () => {
      const options = new EncryptionOptions({ ownerPassword: 'secret123' });
      assert.throws(() => {
        options.permissions.modify = true;
      }, { name: 'TypeError' }); // Object.freeze throws TypeError
    });

    it('should return frozen permissions object', () => {
      const options = new EncryptionOptions({ ownerPassword: 'secret123' });
      assert.strictEqual(Object.isFrozen(options.permissions), true);
    });
  });

  describe('toJSON', () => {
    it('should serialize to plain object', () => {
      const options = new EncryptionOptions({
        userPassword: 'user123',
        ownerPassword: 'owner123',
      });
      const json = options.toJSON();
      assert.deepStrictEqual(json, {
        userPassword: 'user123',
        ownerPassword: 'owner123',
        permissions: {
          modify: false,
          copy: false,
          print: true,
          printHighQuality: true,
          annotate: false,
          fillForms: false,
          extract: false,
          assemble: false,
        },
      });
    });
  });
});