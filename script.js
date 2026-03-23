// ═══════════════════════════════════════════════════════
// SAMEER BORKAR — IMAGE-BASED PORTFOLIO (No 3D)
// Smooth scroll reveals + mobile menu + micro-animations
// + DRIFTING CAR CURSOR FOLLOWER
// ═══════════════════════════════════════════════════════

// Scroll reveal observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.content').forEach(el => observer.observe(el));

// Mobile menu
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Smooth parallax on hero image
const heroImg = document.querySelector('.hero-image img');
if (heroImg) {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            heroImg.style.transform = `translateY(${scrolled * 0.05}px)`;
        }
    });
}

// ═══════════════════════════════════════════════════════
// DRIFTING CAR — Follows cursor with drift physics
// ═══════════════════════════════════════════════════════
(function () {
    // Only on desktop (no touch)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    // --- Create DOM elements ---
    const car = document.createElement('div');
    car.id = 'drift-car';
    car.innerHTML = `
        <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Ferrari Body — Low sleek profile -->
            <path d="M8 28 Q2 28 2 24 L4 20 L18 18 L38 10 Q42 8 48 8 L78 8 Q82 8 84 10 L98 16 L112 18 Q118 19 118 22 L118 26 Q118 28 116 28 Z" fill="#FF2800"/>
            <!-- Racing stripe accent -->
            <path d="M20 20 L100 16" stroke="#cc2000" stroke-width="0.8" opacity="0.5"/>
            <!-- Cabin / Windshield -->
            <path d="M42 10 L36 18 L70 18 L78 10 Q74 8 48 8 Z" fill="#1a1a2e" stroke="#111" stroke-width="0.5"/>
            <!-- Windows -->
            <path d="M38 17 L43 10 L56 10 L56 17 Z" fill="#87CEEB" opacity="0.6"/>
            <path d="M58 17 L58 10 L75 10 L68 17 Z" fill="#87CEEB" opacity="0.6"/>
            <!-- Side scoop -->
            <path d="M72 18 L80 16 L82 20 L74 22 Z" fill="#cc2000"/>
            <!-- Rear diffuser fins -->
            <rect x="4" y="22" width="8" height="1" rx="0.5" fill="#1a1a1a"/>
            <rect x="4" y="24" width="6" height="1" rx="0.5" fill="#1a1a1a"/>
            <!-- Front Wheels -->
            <circle cx="28" cy="28" r="7" fill="#1a1a1a"/>
            <circle cx="28" cy="28" r="5" fill="#333"/>
            <circle cx="28" cy="28" r="3.5" fill="#c0a000" opacity="0.8"/>
            <circle cx="28" cy="28" r="1.5" fill="#1a1a1a"/>
            <!-- Rear Wheels -->
            <circle cx="94" cy="28" r="7" fill="#1a1a1a"/>
            <circle cx="94" cy="28" r="5" fill="#333"/>
            <circle cx="94" cy="28" r="3.5" fill="#c0a000" opacity="0.8"/>
            <circle cx="94" cy="28" r="1.5" fill="#1a1a1a"/>
            <!-- Headlights -->
            <ellipse cx="114" cy="20" rx="3" ry="2" fill="#FFE066" opacity="0.9"/>
            <!-- Tail lights -->
            <circle cx="5" cy="22" r="2" fill="#ff0000" opacity="0.9"/>
            <!-- Ferrari prancing horse badge hint -->
            <rect x="56" y="19" width="6" height="4" rx="1" fill="#FFD700" opacity="0.7"/>
        </svg>
    `;
    document.body.appendChild(car);

    // Skid marks canvas
    const skidCanvas = document.createElement('canvas');
    skidCanvas.id = 'skid-canvas';
    document.body.appendChild(skidCanvas);
    const ctx = skidCanvas.getContext('2d');

    function resizeCanvas() {
        skidCanvas.width = document.documentElement.scrollWidth;
        skidCanvas.height = document.documentElement.scrollHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- Physics state ---
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let carX = mouseX;
    let carY = mouseY;
    let carVX = 0;
    let carVY = 0;
    let carAngle = 0;       // Current visual angle (rad)
    let driftAngle = 0;     // Extra drift rotation
    let isDrifting = false;
    let speed = 0;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;

    // Skid marks fade
    let skidMarks = [];

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY + window.scrollY;  // account for scroll
    });

    window.addEventListener('scroll', () => {
        mouseY = lastMouseY + window.scrollY;
    });

    // --- Animation loop ---
    function animate() {
        // Target direction
        const dx = mouseX - carX;
        const dy = mouseY - carY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Target angle towards mouse
        const targetAngle = Math.atan2(dy, dx);

        // Acceleration towards mouse — slow & lazy for a drifty feel
        const accel = 0.03;
        const friction = 0.95;
        const driftFriction = 0.97;

        // Speed
        speed = Math.sqrt(carVX * carVX + carVY * carVY);

        // Steer towards mouse — very gentle acceleration
        if (dist > 5) {
            carVX += dx * accel * 0.03;
            carVY += dy * accel * 0.03;
        }

        // Apply friction
        carVX *= friction;
        carVY *= friction;

        // Move car
        carX += carVX;
        carY += carVY;

        // Calculate angle difference for drift detection
        const moveAngle = Math.atan2(carVY, carVX);
        let angleDiff = targetAngle - carAngle;

        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Smooth rotation — the car turns slower than it moves (creates drift)
        carAngle += angleDiff * 0.08;

        // Drift detection — when speed is high and turning sharply
        const turnRate = Math.abs(angleDiff);
        isDrifting = speed > 3 && turnRate > 0.3;

        if (isDrifting) {
            // Add extra visual drift angle
            driftAngle += (angleDiff > 0 ? 0.15 : -0.15);
            driftAngle *= driftFriction;

            // Add skid marks at rear wheel positions
            const rearOffset = 24;
            const wheelSpread = 8;
            const cosA = Math.cos(carAngle);
            const sinA = Math.sin(carAngle);

            // Rear left wheel
            skidMarks.push({
                x: carX - cosA * rearOffset - sinA * wheelSpread,
                y: carY - sinA * rearOffset + cosA * wheelSpread,
                alpha: 0.5,
                size: 2 + speed * 0.3
            });
            // Rear right wheel
            skidMarks.push({
                x: carX - cosA * rearOffset + sinA * wheelSpread,
                y: carY - sinA * rearOffset - cosA * wheelSpread,
                alpha: 0.5,
                size: 2 + speed * 0.3
            });
        } else {
            driftAngle *= 0.9;
        }

        // Apply transform to car element
        const displayAngle = carAngle + driftAngle;
        const screenY = carY - window.scrollY;
        car.style.transform = `translate(${carX - 60}px, ${screenY - 20}px) rotate(${displayAngle}rad)`;

        // Drift visual effects
        if (isDrifting) {
            car.classList.add('drifting');
        } else {
            car.classList.remove('drifting');
        }

        // Draw skid marks
        ctx.clearRect(0, 0, skidCanvas.width, skidCanvas.height);
        for (let i = skidMarks.length - 1; i >= 0; i--) {
            const mark = skidMarks[i];
            mark.alpha -= 0.003;
            if (mark.alpha <= 0) {
                skidMarks.splice(i, 1);
                continue;
            }
            ctx.beginPath();
            ctx.arc(mark.x, mark.y, mark.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(60, 60, 60, ${mark.alpha})`;
            ctx.fill();
        }

        // Cap skid marks array
        if (skidMarks.length > 500) {
            skidMarks = skidMarks.slice(-300);
        }

        lastMouseX = mouseX;
        lastMouseY = mouseY;

        requestAnimationFrame(animate);
    }

    animate();
})();

// ═══════════════════════════════════════════════════════
// PROJECT DETAIL MODAL
// ═══════════════════════════════════════════════════════
function openProjectModal(card) {
    const modal = document.getElementById('project-modal');
    
    // Populate modal content from data attributes
    document.getElementById('modal-img').innerHTML = 
        `<img src="${card.dataset.img}" alt="${card.dataset.title}">`;
    document.getElementById('modal-title').textContent = card.dataset.title;
    document.getElementById('modal-role').textContent = '👤 ' + card.dataset.role;
    document.getElementById('modal-duration').textContent = '⏱️ ' + card.dataset.duration;
    document.getElementById('modal-desc').textContent = card.dataset.desc;
    
    // Tech stack tags
    const techContainer = document.getElementById('modal-tech');
    techContainer.innerHTML = card.dataset.tech.split(', ')
        .map(t => `<span>${t}</span>`).join('');
    
    // Feature list
    const featuresList = document.getElementById('modal-features');
    featuresList.innerHTML = card.dataset.features.split('|')
        .map(f => `<li>${f}</li>`).join('');
    
    // Show modal with animation
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
}

function closeProjectModal(event, forceClose) {
    const modal = document.getElementById('project-modal');
    if (forceClose || event.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectModal({ target: document.getElementById('project-modal') });
    }
});
