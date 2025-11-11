import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Building backend with esbuild...');

try {
  const result = await esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist/main.js',
    external: [
      // Binarios nativos
      '@prisma/client',
      '.prisma',
      // AWS SDK + todas sus dependencias internas
      '@aws-sdk/*',
      '@smithy/*',
      '@aws-crypto/*',
      // class-transformer tiene submódulos con paths específicos que causan problemas
      'class-transformer',
      'class-transformer/storage',
      // NestJS opcionales
      '@nestjs/microservices',
      '@nestjs/websockets',
      '@nestjs/websockets/socket-module',
      '@nestjs/microservices/microservices-module',
    ],
    format: 'cjs',
    sourcemap: false,
    minify: true,
    treeShaking: true,
    metafile: true,
    logLevel: 'info',
    keepNames: true,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    banner: {
      js: '// Backend bundle - SIGEPEN\n// Generated: ' + new Date().toISOString() + '\n',
    },
  });

  console.log('✅ Backend bundle created successfully!');
  console.log('📊 Bundle stats:');
  console.log('   - Output: dist/main.js');
  console.log('   - Minified and tree-shaken');
  
  // Mostrar tamaño del bundle
  const fs = await import('fs');
  const stats = fs.statSync('dist/main.js');
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   - Size: ${sizeMB} MB`);
  
  console.log('   - External dependencies:');
  console.log('     • @prisma/client (native binaries)');
  console.log('     • class-validator/transformer (decorators)');
  console.log('     • @aws-sdk/client-s3 (native modules)');
  console.log('     • cloudinary (dynamic requires)');
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
