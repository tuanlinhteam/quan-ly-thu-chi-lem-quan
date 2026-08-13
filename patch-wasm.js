import fs from 'fs';
import path from 'path';

try {
  const targetFile = path.resolve('node_modules/rollup/dist/native.js');
  const patchCode = `const { parse, xxhashBase64Url, xxhashBase36, xxhashBase16 } = require('@rollup/wasm-node/dist/wasm-node/bindings_wasm.js');
exports.parse = parse;
exports.parseAsync = async (code, allowReturnOutsideFunction, jsx, _signal) => parse(code, allowReturnOutsideFunction, jsx);
exports.xxhashBase64Url = xxhashBase64Url;
exports.xxhashBase36 = xxhashBase36;
exports.xxhashBase16 = xxhashBase16;
`;

  if (fs.existsSync(path.dirname(targetFile))) {
    fs.writeFileSync(targetFile, patchCode);
    console.log('✅ Applied Rollup WASM patch successfully');
  }
} catch (e) {
  // Silent catch
}
