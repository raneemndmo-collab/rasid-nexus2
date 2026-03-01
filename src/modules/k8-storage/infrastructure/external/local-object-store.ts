import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { IObjectStore } from '../../domain/interfaces/storage-repository.interface';

@Injectable()
export class LocalObjectStore implements IObjectStore {
  private readonly basePath: string;
  private readonly encryptionKey: Buffer;

  constructor() {
    this.basePath = process.env.STORAGE_BASE_PATH || '/tmp/rasid-storage';
    const keyHex = process.env.STORAGE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.encryptionKey = Buffer.from(keyHex, 'hex');
  }

  async put(bucket: string, key: string, data: Buffer, encrypted: boolean): Promise<{ checksum: string }> {
    const dir = path.join(this.basePath, bucket);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let dataToWrite = data;
    if (encrypted) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
      const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
      dataToWrite = Buffer.concat([iv, encryptedData]);
    }

    const checksum = crypto.createHash('sha256').update(data).digest('hex');
    const filePath = path.join(dir, key);
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    fs.writeFileSync(filePath, dataToWrite);

    return { checksum };
  }

  async get(bucket: string, key: string): Promise<Buffer> {
    const filePath = path.join(this.basePath, bucket, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Object not found: ${bucket}/${key}`);
    }
    const data = fs.readFileSync(filePath);

    // Try to decrypt — if first 16 bytes look like an IV
    try {
      const iv = data.subarray(0, 16);
      const encryptedData = data.subarray(16);
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
      return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    } catch {
      return data;
    }
  }

  async delete(bucket: string, key: string): Promise<void> {
    const filePath = path.join(this.basePath, bucket, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    const filePath = path.join(this.basePath, bucket, key);
    return fs.existsSync(filePath);
  }
}
