const revealElements = document.querySelectorAll(".reveal");
const progressBar = document.getElementById("scroll-progress-bar");
const particleCanvas = document.getElementById("particle-canvas");
const chartCanvas = document.getElementById("line-chart");
const backToTopButton = document.getElementById("back-to-top");
const contactForm = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");

const revealedCounters = new WeakSet();

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("in-view");

      entry.target.querySelectorAll(".counter").forEach(counter => {
        if (!revealedCounters.has(counter)) {
          animateCounter(counter);
          revealedCounters.add(counter);
        }
      });
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -42px 0px"
  }
);

revealElements.forEach(element => revealObserver.observe(element));

function animateCounter(element) {
  const target = Number(element.dataset.target || "0");
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = value.toLocaleString("pt-BR");

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;

  if (backToTopButton) {
    backToTopButton.classList.toggle("is-visible", scrollTop > 420);
  }
}

window.addEventListener("scroll", updateScrollProgress, {passive: true});
updateScrollProgress();

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  });
}

function createParticles() {
  if (!particleCanvas) {
    return;
  }

  const context = particleCanvas.getContext("2d");
  if (!context) {
    return;
  }

  const pointer = {x: 0, y: 0, active: false};
  let particles = [];

  function resize() {
    particleCanvas.width = window.innerWidth * window.devicePixelRatio;
    particleCanvas.height = window.innerHeight * window.devicePixelRatio;
    particleCanvas.style.width = `${window.innerWidth}px`;
    particleCanvas.style.height = `${window.innerHeight}px`;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    particles = Array.from({length: window.innerWidth < 760 ? 24 : 48}, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2.1 + 0.8,
      speedX: (Math.random() - 0.5) * 0.34,
      speedY: (Math.random() - 0.5) * 0.34,
      alpha: Math.random() * 0.32 + 0.08
    }));
  }

  function draw() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < -20) particle.x = window.innerWidth + 20;
      if (particle.x > window.innerWidth + 20) particle.x = -20;
      if (particle.y < -20) particle.y = window.innerHeight + 20;
      if (particle.y > window.innerHeight + 20) particle.y = -20;

      if (pointer.active) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 120) {
          particle.x -= dx * 0.0018;
          particle.y -= dy * 0.0018;
        }
      }

      context.beginPath();
      context.fillStyle = `rgba(10, 140, 98, ${particle.alpha})`;
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const dx = particle.x - next.x;
        const dy = particle.y - next.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 118) {
          context.beginPath();
          context.strokeStyle = `rgba(10, 140, 98, ${0.1 - distance / 1500})`;
          context.lineWidth = 1;
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  resize();
  draw();
}

function drawChart() {
  if (!chartCanvas) {
    return;
  }

  const context = chartCanvas.getContext("2d");
  if (!context) {
    return;
  }

  const width = chartCanvas.width;
  const height = chartCanvas.height;
  const padding = {top: 36, right: 34, bottom: 44, left: 70};
  const scenarios = [
    {label: "Sem controle", value: 97, color: "#d96855"},
    {label: "Rotina parcial", value: 68, color: "#d2a03a"},
    {label: "Com repor", value: 2, color: "#0a8c62"}
  ];
  const maxValue = 100;
  let progress = 0;

  function drawAxes() {
    context.strokeStyle = "rgba(61, 90, 77, 0.14)";
    context.lineWidth = 1;

    for (let i = 0; i <= 4; i += 1) {
      const y = padding.top + ((height - padding.top - padding.bottom) / 4) * i;
      context.beginPath();
      context.moveTo(padding.left, y);
      context.lineTo(width - padding.right, y);
      context.stroke();
    }

    context.fillStyle = "#6a8478";
    context.font = "12px Manrope";
    [0, 25, 50, 75, 100].forEach((tick, index) => {
      const y = height - padding.bottom - ((height - padding.top - padding.bottom) / 4) * index;
      context.fillText(`${tick}%`, 18, y + 4);
    });
  }

  function drawBars() {
    const availableWidth = width - padding.left - padding.right;
    const barWidth = 118;
    const gap = (availableWidth - barWidth * scenarios.length) / (scenarios.length - 1);

    scenarios.forEach((scenario, index) => {
      const barHeight =
        ((height - padding.top - padding.bottom) * (scenario.value / maxValue)) * progress;
      const x = padding.left + index * (barWidth + gap);
      const y = height - padding.bottom - barHeight;

      const gradient = context.createLinearGradient(x, y, x, height - padding.bottom);
      gradient.addColorStop(0, scenario.color);
      gradient.addColorStop(1, `${scenario.color}88`);

      context.fillStyle = gradient;
      context.beginPath();
      context.roundRect(x, y, barWidth, barHeight, 18);
      context.fill();

      context.fillStyle = "#11271e";
      context.font = "700 13px Manrope";
      context.textAlign = "center";
      context.fillText(scenario.label, x + barWidth / 2, height - 14);

      context.fillStyle = scenario.color;
      context.font = "700 16px Manrope";
      context.fillText(`${scenario.value.toLocaleString("pt-BR")}%`, x + barWidth / 2, y - 10);
    });

    context.textAlign = "start";
  }

  function drawHighlights() {
    context.fillStyle = "#3d5a4d";
    context.font = "600 12px Manrope";
    context.fillText("Percentual estimado de perda evitável", padding.left, 18);
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    drawAxes();
    drawBars();
    drawHighlights();
  }

  const chartObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }

        const duration = 1400;
        const start = performance.now();

        function animate(now) {
          const raw = Math.min((now - start) / duration, 1);
          progress = 1 - Math.pow(1 - raw, 3);
          draw();

          if (raw < 1) {
            requestAnimationFrame(animate);
          }
        }

        requestAnimationFrame(animate);
        chartObserver.disconnect();
      });
    },
    {threshold: 0.35}
  );

  chartObserver.observe(chartCanvas);
  draw();
}

if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const nome = String(formData.get("nome") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const assunto = String(formData.get("assunto") || "").trim();
    const mensagem = String(formData.get("mensagem") || "").trim();

    const subject = encodeURIComponent(`[Site repor] ${assunto}`);
    const body = encodeURIComponent(
      `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`
    );

    window.location.href = `mailto:contato@repor.app?subject=${subject}&body=${body}`;

    if (formFeedback) {
      formFeedback.textContent =
        "Seu aplicativo de e-mail foi aberto com a mensagem pronta para o contato comercial.";
    }
  });
}

createParticles();
drawChart();
