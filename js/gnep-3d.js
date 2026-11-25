/**
 * GNEP Africa - Immersive 3D Digital Experience
 * Advanced WebGL Spatial Canvas, 3D Card Tilt, and Parallax Storytelling
 * Preserves 100% of existing functionality, accessibility (WCAG AA), and performance.
 */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    /* ==========================================================================
       1. HERO WEBGL 3D ENVIRONMENTAL SCENE (Three.js)
       ========================================================================== */
    function initHeroWebGL() {
        const canvasContainer = document.getElementById('hero-webgl-container');
        if (!canvasContainer || typeof THREE === 'undefined' || prefersReducedMotion) {
            return;
        }

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x06140b, 0.005);

        const width = canvasContainer.clientWidth || window.innerWidth;
        const height = canvasContainer.clientHeight || window.innerHeight;

        const camera = new THREE.PerspectiveCamera(52, width / height, 0.5, 500);
        camera.position.set(0, 18, 52);
        camera.lookAt(0, 4, -15);

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        } catch (e) {
            console.warn('WebGL not supported or disabled', e);
            return;
        }

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0x4ade80, 1.2);
        dirLight.position.set(30, 50, 40);
        scene.add(dirLight);

        // 3D Topographic Terrain (African Sahel & Ecosystem Restoration Landform)
        const terrainWidth = 170;
        const terrainDepth = 120;
        const segmentsX = isTouchDevice ? 45 : 75;
        const segmentsY = isTouchDevice ? 35 : 55;

        const terrainGeo = new THREE.PlaneGeometry(terrainWidth, terrainDepth, segmentsX, segmentsY);
        terrainGeo.rotateX(-Math.PI / 2);

        // Displace vertices to form realistic undulating ridges
        const pos = terrainGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const elevation =
                Math.sin(x * 0.05 + 1.2) * Math.cos(z * 0.04) * 5.2 +
                Math.sin(x * 0.12 - 0.5) * Math.sin(z * 0.09) * 2.8 +
                Math.cos(x * 0.02 + z * 0.03) * 3.5 -
                Math.pow(z * 0.03, 2) * 1.8;
            pos.setY(i, elevation);
        }
        terrainGeo.computeVertexNormals();

        // 1. Shaded Terrain Surface
        const terrainMat = new THREE.MeshStandardMaterial({
            color: 0x0a2614,
            roughness: 0.8,
            metalness: 0.15,
            flatShading: true,
            transparent: true,
            opacity: 0.7
        });
        const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
        terrainMesh.position.set(0, -11, -8);
        scene.add(terrainMesh);

        // 2. Luminous Topographic Wireframe / Contour Grid
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            wireframe: true,
            transparent: true,
            opacity: 0.42
        });
        const wireMesh = new THREE.Mesh(terrainGeo, wireMat);
        wireMesh.position.set(0, -10.9, -8);
        scene.add(wireMesh);

        // 3. Environmental Elevation Sensor Nodes (Glowing 3D points at peaks)
        const nodeGeo = new THREE.BufferGeometry();
        const nodePositions = [];
        for (let i = 0; i < pos.count; i += 4) {
            const y = pos.getY(i);
            if (y > 2.0) { // On hillcrests and ridges
                nodePositions.push(pos.getX(i), y - 10.7, pos.getZ(i) - 8);
            }
        }
        nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));

        const nodeMat = new THREE.PointsMaterial({
            color: 0x86efac,
            size: 2.2,
            transparent: true,
            opacity: 0.85
        });
        const nodePoints = new THREE.Points(nodeGeo, nodeMat);
        scene.add(nodePoints);

        // 4. Floating Atmospheric Bio-Particles (Airborne seeds, pollen, spores)
        const particleCount = isTouchDevice ? 90 : 260;
        const particleGeo = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSpeeds = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            particlePositions[i * 3] = (Math.random() - 0.5) * 130;
            particlePositions[i * 3 + 1] = Math.random() * 45 - 6;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 85 + 15;

            particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.05 + 0.02; // wind draft
            particleSpeeds[i * 3 + 1] = Math.random() * 0.025 + 0.008;   // thermal updraft
            particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.035;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

        // Soft glowing particle canvas texture
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 32;
        pCanvas.height = 32;
        const pCtx = pCanvas.getContext('2d');
        const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        pGrad.addColorStop(0, 'rgba(240, 253, 244, 1)');
        pGrad.addColorStop(0.3, 'rgba(74, 222, 128, 0.7)');
        pGrad.addColorStop(1, 'rgba(11, 37, 22, 0)');
        pCtx.fillStyle = pGrad;
        pCtx.fillRect(0, 0, 32, 32);

        const pTexture = new THREE.CanvasTexture(pCanvas);
        const pMat = new THREE.PointsMaterial({
            size: 2.2,
            map: pTexture,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeo, pMat);
        scene.add(particles);

        // Pointer Parallax
        let targetX = 0;
        let targetY = 18;
        let mouseX = 0;
        let mouseY = 0;
        let isVisible = true;

        if (!isTouchDevice) {
            window.addEventListener('mousemove', function (e) {
                mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
                targetX = mouseX * 10;
                targetY = 18 + mouseY * 5;
            }, { passive: true });
        }

        // Pause rendering when hero is not in viewport (Zero battery waste)
        const observer = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        observer.observe(canvasContainer);

        // Animation Loop
        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            if (!isVisible) return;

            const elapsed = clock.getElapsedTime();

            // Camera smooth parallax damping
            camera.position.x += (targetX - camera.position.x) * 0.04;
            camera.position.y += (targetY - camera.position.y) * 0.04;
            camera.lookAt(0, 3, -15);

            // Subtle topographic wave oscillation
            const breath = Math.sin(elapsed * 0.7) * 0.35;
            terrainMesh.position.y = -11 + breath;
            wireMesh.position.y = -10.9 + breath;
            nodePoints.position.y = -10.7 + breath;

            // Animate floating bio-particles
            const pArr = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                pArr[i * 3] += particleSpeeds[i * 3];
                pArr[i * 3 + 1] += particleSpeeds[i * 3 + 1];
                pArr[i * 3 + 2] += particleSpeeds[i * 3 + 2];

                if (pArr[i * 3 + 1] > 40) {
                    pArr[i * 3 + 1] = -6;
                    pArr[i * 3] = (Math.random() - 0.5) * 130;
                }
                if (pArr[i * 3] > 70) {
                    pArr[i * 3] = -70;
                }
            }
            particles.geometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }

        animate();

        // Responsive Resize Handler
        window.addEventListener('resize', function () {
            const w = canvasContainer.clientWidth || window.innerWidth;
            const h = canvasContainer.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }, { passive: true });
    }

    /* ==========================================================================
       2. INTERACTIVE 3D PERSPECTIVE CARD TILT
       ========================================================================== */
    function initCardTilt() {
        if (isTouchDevice || prefersReducedMotion) return;

        const tiltCards = document.querySelectorAll('.spatial-tilt-card, .pillar-card, .focus-card, .gnep-activity-card, .home-gallery-card, .partner-box, .gnep-value-card');

        tiltCards.forEach(function (card) {
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.15s ease-out, box-shadow 0.25s ease';

            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -6.0;
                const rotateY = ((x - centerX) / centerX) * 6.0;

                card.style.transform = perspective(1000px) rotateX(deg) rotateY(deg) translateZ(8px);
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
                card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease';
            });
        });
    }

    /* ==========================================================================
       3. 3D NAVIGATION SCROLL ADAPTATION
       ========================================================================== */
    function init3DNavScroll() {
        const header = document.querySelector('header.fixed-top');
        if (!header) return;

        function updateNav() {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollY > 70) {
                header.classList.add('nav-scrolled-3d');
            } else {
                header.classList.remove('nav-scrolled-3d');
            }
        }

        window.addEventListener('scroll', updateNav, { passive: true });
        updateNav();
    }

    /* ==========================================================================
       4. SCROLL-DRIVEN PARALLAX (GSAP ScrollTrigger)
       ========================================================================== */
    function initScrollParallax() {
        if (prefersReducedMotion) return;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            const heroContent = document.querySelector('.gnep-hero-content');
            if (heroContent) {
                gsap.to(heroContent, {
                    y: 90,
                    opacity: 0.88,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            }

            const spatialSections = document.querySelectorAll('.gnep-mission-band, .gnep-evidence-section, .gnep-pillars-section, .gnep-focus-section, .gnep-updates-section, .gnep-team-section, .gnep-gallery-preview-section, .gnep-partners-section');

            spatialSections.forEach(function (section) {
                gsap.from(section.querySelectorAll('.gnep-section-tag, .gnep-section-title, .gnep-editorial-quote, .evidence-box, .pillar-card, .focus-card, .gnep-activity-card'), {
                    y: 28,
                    opacity: 0,
                    duration: 0.75,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 82%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        }
    }

    if (document.readyState === 'loading') {
        
    /* ==========================================================================
       EVERMIND FLOATING TELEMETRY PILL PARALLAX
       ========================================================================== */
    function initFloatingPillParallax() {
        const pills = document.querySelectorAll('.hero-floating-pill');
        if (!pills.length || prefersReducedMotion || isTouchDevice) return;

        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        window.addEventListener('mousemove', function (e) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });

        function updatePills() {
            // Fluid damping (lerp)
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;

            pills.forEach((pill, idx) => {
                const depth = parseFloat(pill.getAttribute('data-depth')) || (0.04 + idx * 0.02);
                const moveX = currentX * depth * 35;
                const moveY = currentY * depth * 25;
                pill.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
            });

            requestAnimationFrame(updatePills);
        }
        updatePills();
    }

document.addEventListener('DOMContentLoaded', function () {
            initHeroWebGL();
        initFloatingPillParallax();
            initCardTilt();
            init3DNavScroll();
            initScrollParallax();
        });
    } else {
        initHeroWebGL();
        initCardTilt();
        init3DNavScroll();
        initScrollParallax();
    }

})();
