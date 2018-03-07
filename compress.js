'use strict';

var em_module = require('./build/woff2/compress_binding.js');

var runtimeInit = new Promise(resolve => {
  em_module['onRuntimeInitialized'] = resolve;
});

function compress(src) {

  var inputSize = src.length;
  var inputPtr = em_module._malloc(inputSize);
  var input = em_module.HEAPU8.subarray(inputPtr, inputPtr + inputSize);

  input.set(src);

  var compressed_size_wrap = em_module.cwrap('compressed_size', 'number', [ 'number' ], [ 'number' ]);
  var outputSize = compressed_size_wrap(inputPtr, inputSize);
  var outputPtr = em_module._malloc(outputSize);

  var compress_wrap = em_module.cwrap('compress', 'number', [ 'number' ], [ 'number' ], [ 'number' ]);

  outputSize = compress_wrap(inputPtr, inputSize, outputPtr);

  if (outputSize === -1) {
    throw new Error('ConvertTTFToWOFF2 failed');
  }

  var result = em_module.HEAPU8.slice(outputPtr, outputPtr + outputSize);

  em_module._free(inputPtr);
  em_module._free(outputPtr);

  return result;
}

module.exports = function (src) {
  return runtimeInit().then(compress.bind(null, src));
};
