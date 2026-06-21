import { NextResponse } from 'next/server';
const archiver = require('archiver');
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    // Determine the path to the extension folder
    let extensionPath = path.join(process.cwd(), 'apps', 'extension');
    if (!fs.existsSync(extensionPath)) {
      // In case we are running inside apps/web directly
      extensionPath = path.join(process.cwd(), '..', 'extension');
    }
    
    // One more fallback, in case process.cwd() is apps/web/src/something
    if (!fs.existsSync(extensionPath)) {
      extensionPath = path.join(process.cwd(), '../../apps/extension');
    }

    if (!fs.existsSync(extensionPath)) {
      return NextResponse.json({ error: 'Extension directory not found at ' + extensionPath }, { status: 404 });
    }

    // Set up archiver
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // We will collect the data into an array of buffers
    const chunks: Buffer[] = [];
    
    const streamPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err: any) => reject(err));
    });

    // Append the extension directory to the zip archive, placing contents in root
    archive.directory(extensionPath, false);
    archive.finalize();

    const zipBuffer = await streamPromise;

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="novacv-extension.zip"',
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (err: any) {
    console.error('Download extension error:', err);
    return NextResponse.json({ error: 'Failed to create extension zip', message: err.message }, { status: 500 });
  }
}
