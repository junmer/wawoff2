'use strict';

var em_module = require('./build/woff2/decompress_binding.js');

var runtimeInit = new Promise(resolve => {
  em_module['onRuntimeInitialized'] = resolve;
});

function decompress(src) {
  var inputSize = src.length;
  var inputPtr = em_module._malloc(inputSize);
  var input = em_module.HEAPU8.subarray(inputPtr, inputPtr + inputSize);

  input.set(src);

  var decompressed_size_wrap = em_module.cwrap('decompressed_size', 'number', [ 'number' ], [ 'number' ]);
  var outputSize = decompressed_size_wrap(inputPtr, inputSize);
  var outputPtr = em_module._malloc(outputSize);

  var decompress_wrap = em_module.cwrap('decompress', 'number', [ 'number' ], [ 'number' ], [ 'number' ]);

  if (decompress_wrap(inputPtr, inputSize, outputPtr) === -1) {
    throw new Error('ConvertWOFF2ToTTF failed');
  }

  var result = em_module.HEAPU8.slice(outputPtr, outputPtr + outputSize);

  em_module._free(inputPtr);
  em_module._free(outputPtr);

  return result;
}

module.exports = function (src) {
  return runtimeInit().then(decompress.bind(null, src));
};
