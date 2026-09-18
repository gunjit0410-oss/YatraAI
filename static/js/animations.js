/**
 * YatraAI GSAP & Micro-Interactions Animation Engine
 */

document.addEventListener("DOMContentLoaded", function() {
    // Check if GSAP library is available
    if (typeof gsap === "undefined") {
        console.warn("GSAP not loaded; using CSS fallback animations.");
        return;
    }

    // 1. Hero Section Entrance Animation
    if (document.querySelector(".hero-title")) {
        gsap.from(".hero-title", {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: "power3.out",
            clearProps: "all"
        });

        gsap.from(".hero-subtitle", {
            duration: 0.8,
            y: 20,
            opacity: 0,
            delay: 0.2,
            ease: "power3.out",
            clearProps: "all"
        });

        gsap.from(".hero-section .btn", {
            duration: 0.8,
            y: 20,
            opacity: 0,
            delay: 0.4,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "all"
        });
    }

    // 2. Staggered Card Reveals on Grid Load (Ensures clearProps: "all" so opacity remains 100%)
    if (document.querySelectorAll(".place-card").length > 0) {
        gsap.from(".place-card", {
            duration: 0.6,
            y: 25,
            opacity: 0,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "all"
        });
    }

    // 3. Category Pills Stagger
    if (document.querySelectorAll(".category-pill-card").length > 0) {
        gsap.from(".category-pill-card", {
            duration: 0.5,
            scale: 0.95,
            opacity: 0,
            stagger: 0.05,
            ease: "back.out(1.5)",
            clearProps: "all"
        });
    }

    // 4. Recommendation Cards Entrance Animation
    if (document.querySelectorAll(".recommendation-card-item").length > 0) {
        gsap.from(".recommendation-card-item", {
            duration: 0.6,
            x: -20,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all"
        });
    }
});
