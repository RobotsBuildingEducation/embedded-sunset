import test from "node:test";
import assert from "node:assert/strict";
import { createOrbRendererPool } from "./sharedOrbRenderer.js";

test("live collection scenes share one context and copy each rendered frame at the correct size", () => {
  let created = 0, disposed = 0, frames = 0;
  const copies = [];
  const acquire = createOrbRendererPool(() => {
    created++;
    const element = {width:2,height:2};
    return {
      domElement:element, setSize(w,h) { element.width=w*2; element.height=h*2; },
      setRenderTarget() {}, setViewport() {}, setScissor() {}, setScissorTest() {},
      render() {frames++;}, getPixelRatio:()=>2, dispose() {disposed++;}, forceContextLoss() {},
    };
  }, () => ({width:0,height:0,getContext:()=>({clearRect(){},drawImage(...args){copies.push(args.slice(1));}})}));
  const hero = acquire(), first = acquire(), second = acquire();
  assert.equal(created,1);
  assert.equal(hero.renderer,first.renderer);
  hero.render({}, {}, 210, 210);
  first.render({}, {}, 82, 82);
  second.render({}, {}, 82, 82);
  first.render({}, {}, 82, 82);
  assert.equal(frames,4);
  assert.deepEqual(copies[1],[0,256,164,164,0,0,164,164]);
  assert.equal(first.canvas.width,164);
  hero.release(); hero.release();
  assert.equal(disposed,0);
  first.release(); second.release();
  assert.equal(disposed,1);
  first.render({}, {}, 82, 82);
  assert.equal(frames,4);
  const reopened = acquire();
  assert.equal(created,2);
  reopened.release();
  assert.equal(disposed,2);
});
