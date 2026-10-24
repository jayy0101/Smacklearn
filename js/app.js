/* =========================
   CINEMATIC VIDEO CONTROLLER
========================= */

const video = document.getElementById("backgroundVideo");

if (video) {
    let animationFrame = null;
    let fadingOut = false;

    const FADE_DURATION = 500;
    const FADE_OUT_BEFORE_END = 0.55;

    function cancelFade() {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    function fadeTo(targetOpacity, duration = FADE_DURATION) {
        cancelFade();

        const startOpacity = Number(video.style.opacity) || 0;
        const startTime = performance.now();

        function animate(now) {
            const progress = Math.min(
                (now - startTime) / duration,
                1
            );

            const eased =
                progress * progress * (3 - 2 * progress);

            const opacity =
                startOpacity +
                (targetOpacity - startOpacity) * eased;

            video.style.opacity = String(opacity);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                animationFrame = null;
            }
        }

        animationFrame = requestAnimationFrame(animate);
    }

    function startVideo() {
        fadingOut = false;

        video.style.opacity = video.style.opacity || "0";

        video.play()
            .then(() => fadeTo(1))
            .catch(() => {
                // Autoplay may be blocked by the browser.
            });
    }

    video.addEventListener("timeupdate", () => {
        if (
            Number.isFinite(video.duration) &&
            video.duration - video.currentTime <= FADE_OUT_BEFORE_END &&
            !fadingOut
        ) {
            fadingOut = true;
            fadeTo(0);
        }
    });

    video.addEventListener("ended", () => {
        cancelFade();

        video.style.opacity = "0";

        setTimeout(() => {
            video.currentTime = 0;
            startVideo();
        }, 100);
    });

    video.addEventListener("playing", () => {
        if (!fadingOut && video.style.opacity !== "1") {
            fadeTo(1);
        }
    });

    startVideo();
}