// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

'use strict';

load("test/mjsunit/wasm/wasm-constants.js");
load("test/mjsunit/wasm/wasm-module-builder.js");

var builder = new WasmModuleBuilder();
builder.addImportedTable("x", "table", 1, 10000000);
builder.addFunction("main", kSig_i_i)
  .addBody([
    kExprI32Const, 0,
    kExprGetLocal, 0,
    kExprCallIndirect, 0, kTableZero])
  .exportAs("main");
let module = new WebAssembly.Module(builder.toBuffer());
let table = new WebAssembly.Table({element: "anyfunc",
  initial: 1, maximum:1000000});
let instance = new WebAssembly.Instance(module, {x: {table:table}});

table.grow(0x40001);

let instance2 = new WebAssembly.Instance(module, {x: {table:table}});

try {
  instance2.exports.main(402982); // should be OOB
} catch (e) {
  print("Correctly caught: ", e);
}
