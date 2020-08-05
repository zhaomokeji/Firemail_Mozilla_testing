// DO NOT EDIT! This test has been generated by /html/canvas/tools/gentest.py.
// OffscreenCanvas test in a worker:2d.composite.operation.darker
// Description:
// Note:

importScripts("/resources/testharness.js");
importScripts("/html/canvas/resources/canvas-tests.js");

var t = async_test("");
var t_pass = t.done.bind(t);
var t_fail = t.step_func(function(reason) {
    throw reason;
});
t.step(function() {

var offscreenCanvas = new OffscreenCanvas(100, 50);
var ctx = offscreenCanvas.getContext('2d');

ctx.globalCompositeOperation = 'xor';
ctx.globalCompositeOperation = 'darker';
_assertSame(ctx.globalCompositeOperation, 'xor', "ctx.globalCompositeOperation", "'xor'");
t.done();

});
done();
