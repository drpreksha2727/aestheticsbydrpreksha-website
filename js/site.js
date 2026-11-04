// Shared behaviour for every page. Each block checks that its section exists,
// so pages only run the motion they actually contain.
const $ = s => document.querySelector(s);

const yrEl = document.getElementById('yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();
document.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => document.getElementById('nav')?.classList.remove('open')));

// Booking form → WhatsApp
document.getElementById('bookForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const msg = `Hi Dr. Preksha's Aesthetics, I'd like to book an appointment.\nName: ${v('n')}\nPhone: ${v('p')}\nLooking for: ${v('t')}` + (v('d') ? `\nPreferred date: ${v('d')}` : '') + (v('m') ? `\nNote: ${v('m')}` : '');
  window.open('https://wa.me/917717567426?text=' + encodeURIComponent(msg), '_blank', 'noopener');
});

// Split the statement into words for the scroll-fill effect
document.querySelectorAll('[data-words]').forEach(p => {
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (/^\s+$/.test(t)) frag.append(t);
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.append(s); }
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) walk(n);
  });
  walk(p);
});

// Before/after slider (works with or without animation libraries)
function setBA(ba, p) { ba.style.setProperty('--p', p + '%'); const i = ba.querySelector('input'); if (i) i.value = p; }
document.querySelectorAll('.ba input').forEach(inp => inp.addEventListener('input', () => setBA(inp.closest('.ba'), inp.value)));

// Flip cards: tap/Enter to flip on touch and keyboard
document.querySelectorAll('.flip').forEach(c => {
  c.addEventListener('click', () => c.classList.toggle('on'));
  c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.classList.toggle('on'); } });
});

// Play background videos only while visible (saves data and battery)
const vio = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
}), { threshold: 0 });
document.querySelectorAll('.film video, #ctaVid').forEach(v => vio.observe(v));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!window.gsap || reduce) {
  document.querySelectorAll('.statement .w').forEach(w => w.style.opacity = 1);
} else {
  gsap.registerPlugin(ScrollTrigger);

  // Smooth inertial scrolling
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -10 }); }
    }));
  }

  const mm = gsap.matchMedia();
  const fine = matchMedia('(pointer:fine)').matches;

  // ---- Home hero ----
  if ($('.hero')) {
    gsap.from('.h-title .line>span', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: .09, delay: .15 });
    gsap.from('.face3d', { y: 80, opacity: 0, duration: 1.4, ease: 'power3.out' });
    gsap.from('.chip3d', { opacity: 0, scale: .85, duration: .8, stagger: .12, delay: .7, ease: 'back.out(1.6)' });
    gsap.from('.h-stats div, .trust, .h-title p, .h-title .btn', { opacity: 0, y: 16, duration: .8, stagger: .06, delay: .5 });
    if ($('#iFrame')) gsap.from('#iFrame', { opacity: 0, scale: 1.08, y: 30, duration: 1.8, ease: 'expo.out', delay: .15 });

    const face = document.getElementById('face');
    if (face && fine) {
      const rx = gsap.quickTo(face, 'rotationX', { duration: .9, ease: 'power3' });
      const ry = gsap.quickTo(face, 'rotationY', { duration: .9, ease: 'power3' });
      const hero = document.getElementById('hero');
      hero.addEventListener('pointermove', e => {
        const r = e.currentTarget.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 14);
        rx(-((e.clientY - r.top) / r.height - .5) * 10);
      });
      hero.addEventListener('pointerleave', () => { rx(0); ry(0); });
    }
  }

  // ---- Inner-page header ----
  if ($('.phead')) {
    gsap.from('.phead .ph-in > *', { y: 40, opacity: 0, duration: 1.1, ease: 'power4.out', stagger: .08, delay: .1 });
  }

  mm.add('(min-width: 701px)', () => {
    // Hero card shrinks and tilts back in 3D as you scroll away
    if ($('.hero-wrap')) {
      gsap.timeline({ scrollTrigger: { trigger: '.hero-wrap', start: 'top top', end: 'bottom top', scrub: true } })
        .to('#hero', { scale: .9, rotationX: 8, borderRadius: 40, transformPerspective: 1400, transformOrigin: 'center top', ease: 'none' }, 0)
        .to('.face3d', { yPercent: 12, scale: 1.06, ease: 'none' }, 0)
        .to('.h-title', { y: -60, opacity: .2, ease: 'none' }, 0);
    }

    // Horizontal treatment rail with cards turning in 3D
    const track = document.getElementById('track');
    if (track) {
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.treat', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true }
      });
      gsap.utils.toArray('.card').forEach(card => {
        gsap.timeline({ scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
          .fromTo(card, { rotationY: -24, z: -120 }, { rotationY: 0, z: 0, ease: 'none' })
          .to(card, { rotationY: 24, z: -120, ease: 'none' });
        const img = card.querySelector('.img img');
        if (img) gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    }

    // Stacking process cards: earlier cards sink back as the next arrives
    const scs = gsap.utils.toArray('.sc');
    scs.forEach((sc, i) => {
      if (i === scs.length - 1) return;
      gsap.to(sc, { scale: .9, y: -20, ease: 'none', scrollTrigger: { trigger: scs[i + 1], start: 'top bottom', end: 'top 12%', scrub: true } });
    });

    // Reviews tilt in from depth
    if ($('.rv-row')) gsap.from('.rv', { rotationX: 35, y: 120, z: -200, opacity: 0, stagger: .12, ease: 'power3.out', duration: 1.2, scrollTrigger: { trigger: '.rv-row', start: 'top 85%' } });

    // Film: small rounded card grows to full-bleed while pinned
    if ($('.film')) {
      gsap.timeline({ scrollTrigger: { trigger: '.film', start: 'top top', end: 'bottom bottom', scrub: true } })
        .to('#filmFrame', { width: '100vw', height: '100vh', borderRadius: 0, ease: 'none' }, 0)
        .from('.film .quote', { scale: .8, opacity: .4, ease: 'none' }, 0);
    }

    // Gallery drifts sideways with the scroll and skews with scroll speed
    const gTrack = document.getElementById('gTrack');
    if (gTrack) {
      gsap.fromTo(gTrack, { x: () => innerWidth * .1 }, { x: () => -(gTrack.scrollWidth - innerWidth * .9), ease: 'none',
        scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true,
          onUpdate: self => gsap.to('.g-item', { skewX: gsap.utils.clamp(-8, 8, self.getVelocity() / -300), duration: .4, overwrite: 'auto' }) } });
      gsap.utils.toArray('.g-item img').forEach(img => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: true } }));
    }

    // Beyond-the-face: floating images at different depths
    gsap.utils.toArray('.beyond .fl').forEach(f => gsap.fromTo(f, { y: 120 * +f.dataset.depth, rotation: -4 * +f.dataset.depth }, { y: -160 * +f.dataset.depth, rotation: 4 * +f.dataset.depth, ease: 'none',
      scrollTrigger: { trigger: '.beyond', start: 'top bottom', end: 'bottom top', scrub: true } }));

    // Result cards and flip cards rise in with depth
    if ($('.r-grid')) gsap.from('.rcard', { y: 120, rotationX: 22, transformPerspective: 1400, opacity: 0, stagger: .15, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.r-grid', start: 'top 85%' } });
    if ($('.s-row')) gsap.from('.flip', { y: 80, rotationY: -25, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.s-row', start: 'top 88%' } });
  });

  // Statement fills word by word
  if ($('.statement')) gsap.to('.statement .w', { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top 75%', end: 'bottom 60%', scrub: true } });

  // Parallax images
  gsap.utils.toArray('[data-par]').forEach(img => {
    gsap.fromTo(img, { yPercent: 0 }, { yPercent: +img.dataset.par, ease: 'none',
      scrollTrigger: { trigger: img.closest('figure, .bgimg'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Gentle rise for headings and blocks
  gsap.utils.toArray('.about h2, .about p, .facts, .process>h2, .reviews .hd, .visit .box, .ft, .sec-hd, .faq details').forEach(el => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  // Cards rise in from depth
  gsap.utils.toArray('.tr-grid, .j-grid, .m-row, .q-grid, .ex-grid').forEach(grid => {
    gsap.from(grid.querySelectorAll('.tr, .post, .myth, .qcard, .ex'), { y: 90, rotationX: 18, transformPerspective: 1200, opacity: 0, stagger: .1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 85%' } });
  });
  if ($('.season')) gsap.from('.season', { scale: .94, borderRadius: 60, ease: 'none', scrollTrigger: { trigger: '.season', start: 'top bottom', end: 'top 30%', scrub: true } });
  if ($('.cta')) gsap.from('.cta h2', { scale: .85, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top 85%', end: 'top 25%', scrub: true } });

  // Before/after: one gentle sweep when it first comes into view
  document.querySelectorAll('.ba').forEach(ba => {
    const st = { p: 50 };
    gsap.timeline({ scrollTrigger: { trigger: ba, start: 'top 70%', once: true } })
      .to(st, { p: 78, duration: .9, ease: 'power2.inOut', onUpdate: () => setBA(ba, st.p) })
      .to(st, { p: 22, duration: 1.2, ease: 'power2.inOut', onUpdate: () => setBA(ba, st.p) })
      .to(st, { p: 50, duration: .9, ease: 'power2.inOut', onUpdate: () => setBA(ba, st.p) });
  });

  // 3D tilt on result and explore cards (pointer devices)
  if (fine) {
    document.querySelectorAll('.tilt').forEach(card => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3' });
      gsap.set(card, { transformPerspective: 1200 });
      card.addEventListener('pointermove', e => {
        if (e.target.closest('.ba')) { rx(0); ry(0); return; }
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 10);
        rx(-((e.clientY - r.top) / r.height - .5) * 8);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
}

// Home hero: the veil photo rendered in WebGL — the silk flows, the face stays still
(function () {
  const frame = document.getElementById('iFrame'), canvas = document.getElementById('veilGL');
  if (!frame || !canvas || !window.THREE) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = { uTex: { value: null }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uFlow: { value: reduce ? 0 : 1 }, uFrame: { value: 736 / 1313 }, uImg: { value: 736 / 1313 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      precision highp float;
      uniform sampler2D uTex; uniform float uTime; uniform vec2 uMouse; uniform float uFlow; uniform float uFrame; uniform float uImg;
      varying vec2 vUv;
      void main(){
        // "cover" fit: keep the photo's real proportions whatever shape the frame is
        vec2 uv = vUv - .5;
        if (uFrame > uImg) uv.y *= uImg / uFrame; else uv.x *= uFrame / uImg;
        uv += .5;
        // keep the face (nose + lips) perfectly still; let the silk around it move
        float face = length((uv - vec2(.5, .47)) * vec2(1.15, .85));
        float silk = smoothstep(.10, .30, face) * uFlow;
        float t = uTime;
        vec2 flow = vec2(
          sin(uv.y * 9.0 + t * .9) * .55 + sin(uv.x * 5.0 - t * .6 + uv.y * 4.0) * .45,
          cos(uv.x * 8.0 + t * .75) * .5 + sin(uv.y * 6.5 - t * .5) * .5
        ) * .0075 * silk;
        // depth parallax: the centre sits closer to the viewer than the edges
        float depth = 1.0 - smoothstep(.0, .75, face);
        vec2 par = uMouse * (.012 + .018 * depth);
        vec2 st = (uv - .5) * .96 + .5 + flow + par;
        vec3 col = texture2D(uTex, st).rgb;
        // soft light gliding across the silk
        float sheen = sin(uv.x * 7.0 + uv.y * 11.0 - t * 1.1) * .5 + .5;
        col += pow(sheen, 6.0) * .07 * silk;
        // gentle vignette
        col *= 1.0 - .18 * smoothstep(.45, .95, length((vUv - .5) * vec2(1.0, .7)));
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  new THREE.TextureLoader().load(frame.querySelector('img').src, tex => {
    tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    uniforms.uTex.value = tex; frame.classList.add('gl'); start();
  });

  let fw = 0, fh = 0;
  function size() {
    const w = frame.offsetWidth, h = frame.offsetHeight;
    if (!w || !h || (w === fw && h === fh)) return;
    fw = w; fh = h; renderer.setSize(w, h, false); uniforms.uFrame.value = w / h;
  }
  size(); addEventListener('resize', size);

  let tx = 0, ty = 0;
  addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 2; ty = -(e.clientY / innerHeight - .5) * 2; }, { passive: true });

  let running = true;
  new IntersectionObserver(es => { running = es[0].isIntersecting; if (running) loop(); }).observe(frame);
  const clock = new THREE.Clock();
  function loop() {
    if (!running || !uniforms.uTex.value) return;
    requestAnimationFrame(loop);
    size();
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.x += (tx - uniforms.uMouse.value.x) * .05;
    uniforms.uMouse.value.y += (ty - uniforms.uMouse.value.y) * .05;
    renderer.render(scene, cam);
  }
  function start() { size(); loop(); }
})();
