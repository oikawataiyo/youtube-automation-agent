/* =====================================================================
 * scene-kit.js — shared three.js + caption helpers for why-you-pull-away-v2
 * ---------------------------------------------------------------------
 * Ported from the proven seg-00 (index.html) implementation so the five
 * remaining 3D segments (seg-01..04, seg-06) don't duplicate the chibi /
 * room / chair / renderer / caption code. Loaded via a classic <script src>
 * BEFORE each composition's inline script. Exposes window.SceneKit.
 *
 * Deterministic only — no Date.now / Math.random / rAF. All motion is
 * driven by the caller's GSAP timeline; rendering happens in onUpdate.
 *
 * v2 enhancements (vs v1):
 *  - Brighter baseline: ACESFilmic tone mapping + exposure in makeRenderer,
 *    lifted COL.COLD luminance, and warmLight() with higher key/ambient floors
 *    so "cold" beats read slate-blue instead of near-black.
 *  - makeCameraRig(presets): multi-framing camera with deterministic hard cuts
 *    (tl.set(state,{idx,push})) so segments stop holding one angle too long.
 * ===================================================================== */
(function () {
  "use strict";

  const COL = {
    BG: 0x0e1116,
    WARM: "#f0a35c",
    COLD: "#8b9bb0", // v2: lifted from #6b7a8f so cold beats are slate-blue, not black
    DOORGLOW: "#ffcaa0",
    SKIN: 0xe8c9a8, // protagonist
    SKIN2: 0xc9a98a, // the other figure (dimmer)
    WOOD: 0x3a3330,
    INK: "#f4efe6", // active caption word
    MUTE: "#5b6472", // caption at rest
  };

  // ---- renderer ----------------------------------------------------------
  function makeRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(1);
    renderer.setSize(1920, 1080, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // v2: filmic tone curve lifts shadow detail and gives a brighter, graded look
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    return renderer;
  }

  // ---- v2 soft fill — directionless baseline lift so frames never go black --
  // HemisphereLight: cool sky from above, faint warm bounce from the floor.
  // The single biggest lever against "the whole picture is too dark", because
  // it lifts the large dark floor/wall areas without flattening the key light.
  function makeFill(intensity) {
    return new THREE.HemisphereLight(0x7d8fb3, 0x3a322a, intensity == null ? 0.55 : intensity);
  }

  // ---- v2 warmth response: standard key+ambient with brighter floors -----
  // Mutates key & ambient in place. coldCol/warmCol are THREE.Color. Replaces
  // the per-seg `key.intensity = 0.5 + warm*0.8` formula whose floor read black.
  function warmLight(key, ambient, warm, coldCol, warmCol) {
    key.color.copy(coldCol).lerp(warmCol, warm);
    key.intensity = 1.05 + warm * 0.85; // floor 0.5 -> 1.05
    ambient.intensity = 0.7 + warm * 0.3; // floor 0.34 -> 0.7
  }

  // ---- v2 multi-camera cut rig (deterministic, seek-safe) ----------------
  // presets: [{ pos:Vector3, posNear?:Vector3, look:Vector3 }, ...]
  //   hard cut:      tl.set(rig.state, { idx: 2, push: 0 }, t)
  //   dolly in shot: tl.to(rig.state,  { push: 1, duration: 5 }, t)
  // Call rig.apply() inside the render() that runs on the timeline onUpdate.
  function makeCameraRig(presets, fov) {
    const camera = new THREE.PerspectiveCamera(fov == null ? 38 : fov, 1920 / 1080, 0.1, 100);
    const state = { idx: 0, push: 0 };
    function apply() {
      const i = Math.max(0, Math.min(presets.length - 1, Math.round(state.idx)));
      const p = presets[i];
      if (p.posNear) camera.position.lerpVectors(p.pos, p.posNear, state.push);
      else camera.position.copy(p.pos);
      camera.lookAt(p.look);
    }
    return { camera, state, apply };
  }

  // ---- v2 cut scheduler — guarantees no framing is held longer than `dur` --
  // cut(t, idx, dollyDur?)   hard cut to framing idx (+ optional intra-shot dolly)
  // auto(from, to, dur, frames[, dolly])  cut every `dur`s across [from,to),
  //   cycling through `frames`. Keep dur <= 4 to honor the "max 4s hold" rule.
  function makeCutter(tl, state) {
    function cut(t, idx, dollyDur) {
      tl.set(state, { idx, push: 0 }, t);
      if (dollyDur) tl.to(state, { push: 1, duration: dollyDur, ease: "sine.inOut" }, t);
    }
    function auto(from, to, dur, frames, dolly) {
      let i = 0;
      for (let t = from; t < to - 0.05; t += dur) {
        cut(t, frames[i % frames.length], dolly ? Math.min(dur, to - t) : 0);
        i++;
      }
    }
    return { cut, auto };
  }

  // ---- scene with night base + depth fog --------------------------------
  function makeScene(fogNear, fogFar) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COL.BG);
    scene.fog = new THREE.Fog(COL.BG, fogNear == null ? 6.5 : fogNear, fogFar == null ? 16 : fogFar);
    return scene;
  }

  // ---- standard key + ambient rig (caller mutates color/intensity) ------
  function makeKeyLight() {
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2.6, 4.2, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 16;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.0008;
    return key;
  }

  // ---- chibi builder (two-head-tall, primitives only) -------------------
  // scale shrinks the whole figure (use ~0.6 for a child). Returns the parts
  // a pose-proxy needs to drive: group, pelvis, head, armL, armR.
  function makeChibi(skinHex, scale) {
    scale = scale == null ? 1 : scale;
    const mat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.85 });
    const group = new THREE.Group();
    const pelvis = new THREE.Group();
    group.add(pelvis);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.5, 6, 14), mat);
    torso.position.y = 0.5;
    torso.castShadow = true;
    pelvis.add(torso);

    const head = new THREE.Group();
    head.position.y = 1.18;
    pelvis.add(head);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 26, 20), mat);
    headMesh.castShadow = true;
    head.add(headMesh);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a2320, roughness: 0.5 });
    const eyeGeo = new THREE.SphereGeometry(0.062, 12, 10);
    const eL = new THREE.Mesh(eyeGeo, eyeMat);
    eL.position.set(-0.17, 0.04, 0.46);
    head.add(eL);
    const eR = new THREE.Mesh(eyeGeo, eyeMat);
    eR.position.set(0.17, 0.04, 0.46);
    head.add(eR);

    function makeArm(side) {
      const sh = new THREE.Group();
      sh.position.set(side * 0.42, 0.78, 0);
      pelvis.add(sh);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.34, 4, 10), mat);
      upper.position.y = -0.22;
      upper.castShadow = true;
      sh.add(upper);
      const fore = new THREE.Group();
      fore.position.y = -0.44;
      sh.add(fore);
      const foreMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.3, 4, 10), mat);
      foreMesh.position.y = -0.2;
      foreMesh.castShadow = true;
      fore.add(foreMesh);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), mat);
      hand.position.y = -0.42;
      hand.castShadow = true;
      fore.add(hand);
      fore.rotation.x = 0.2; // slight resting bend
      return { sh, fore, hand };
    }
    const armL = makeArm(-1);
    const armR = makeArm(1);

    function makeLeg(side) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.2, 0.0, 0.0);
      pelvis.add(hip);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.3, 4, 10), mat);
      thigh.rotation.x = (Math.PI / 2) * 0.92;
      thigh.position.set(0, -0.05, 0.22);
      thigh.castShadow = true;
      hip.add(thigh);
      const knee = new THREE.Group();
      knee.position.set(0, -0.36, 0.34);
      hip.add(knee);
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.34, 4, 10), mat);
      shin.castShadow = true;
      knee.add(shin);
      return { hip, knee };
    }
    const legL = makeLeg(-1);
    const legR = makeLeg(1);

    group.scale.setScalar(scale);
    return { group, pelvis, head, armL, armR, legL, legR, mat };
  }

  // ---- simple wooden chair ----------------------------------------------
  function makeChair(woodMat, x, z, flip) {
    const c = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), woodMat);
    seat.position.y = 0.95;
    seat.castShadow = true;
    c.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.1), woodMat);
    back.position.set(0, 1.35, flip * 0.3);
    back.castShadow = true;
    c.add(back);
    for (const sx of [-0.28, 0.28]) {
      for (const sz of [-0.28, 0.28]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.08), woodMat);
        leg.position.set(sx, 0.475, sz);
        c.add(leg);
      }
    }
    c.position.set(x, 0, z);
    return c;
  }

  // ---- caption karaoke ---------------------------------------------------
  // Splits a window.segNN word array into sentence phrases, builds the DOM,
  // and (when given a timeline) wires fade-in / per-word fill / fade-out.
  // Returns the phrase descriptors so the caller can tweak if needed.
  function buildCaptions(words, capHost) {
    const phrases = [];
    let cur = [];
    (words || []).forEach((w) => {
      cur.push(w);
      if (/[.!?]$/.test(w[0])) {
        phrases.push(cur);
        cur = [];
      }
    });
    if (cur.length) phrases.push(cur);
    return phrases.map((ph) => {
      const div = document.createElement("div");
      div.className = "phrase";
      ph.forEach((w) => {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = w[0] + " ";
        s.dataset.start = w[1];
        div.appendChild(s);
      });
      capHost.appendChild(div);
      return {
        el: div,
        start: ph[0][1],
        end: ph[ph.length - 1][2],
        words: [...div.querySelectorAll(".w")],
      };
    });
  }

  function wireCaptions(tl, phraseEls, END) {
    phraseEls.forEach((p, i) => {
      const showAt = Math.max(0, p.start - 0.18);
      const hideAt = i < phraseEls.length - 1 ? phraseEls[i + 1].start - 0.12 : END - 0.1;
      tl.fromTo(p.el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, showAt);
      p.words.forEach((wEl) => {
        tl.to(wEl, { color: COL.INK, duration: 0.12, ease: "none" }, parseFloat(wEl.dataset.start));
      });
      if (i < phraseEls.length - 1) {
        tl.to(p.el, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, hideAt);
        tl.set(p.el, { opacity: 0, visibility: "hidden" }, hideAt + 0.3);
      } else {
        tl.to(p.el, { opacity: 0, duration: 0.6, ease: "power2.in" }, END - 0.7);
      }
    });
  }

  window.SceneKit = {
    COL,
    makeRenderer,
    makeScene,
    makeKeyLight,
    makeChibi,
    makeChair,
    buildCaptions,
    wireCaptions,
    warmLight,
    makeFill,
    makeCameraRig,
    makeCutter,
  };
})();
