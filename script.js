(() => {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.addEventListener('pageshow', () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));

      const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;

      const letter = document.querySelector('.letter');
      if (!letter) return;
      const targets = [letter, ...letter.children, document.querySelector('footer')];
      const animations = new Set();
      let observer;

      function updateMotion() {
        observer?.disconnect();
        animations.forEach(animation => animation.finish());
        animations.clear();
        if (motionPreference.matches) return;

        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);

            const isPaper = entry.target === letter;
            const keyframes = isPaper
              ? [
                  { transform: 'translateY(28px) scale(.985)' },
                  { transform: 'translateY(0) scale(1)' }
                ]
              : [
                  { opacity: 0, transform: 'translateY(22px)' },
                  { opacity: 1, transform: 'translateY(0)' }
                ];
            const animation = entry.target.animate(keyframes, {
              duration: isPaper ? 1100 : 850,
              easing: 'cubic-bezier(.22, 1, .36, 1)'
            });
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

        targets.forEach(target => observer.observe(target));
      }

      updateMotion();
      motionPreference.addEventListener('change', updateMotion);
      window.addEventListener('beforeprint', () => {
        observer?.disconnect();
        animations.forEach(animation => animation.finish());
      });
      window.addEventListener('afterprint', updateMotion);
    })();
