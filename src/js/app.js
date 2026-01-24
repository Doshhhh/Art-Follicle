(() => {
  // Wait for DOM to be fully loaded before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  function initApp() {
    const body = document.body;

  /* ====== Theme Switcher ====== */
  const themeToggle = document.querySelector(".theme-toggle");
  const themeToggleMobile = document.querySelector(".theme-toggle--mobile");
  const html = document.documentElement;

  // Check for saved theme preference or default to light theme
  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    // Always default to light theme
    return "light";
  };

  // Apply theme to document
  const applyTheme = (theme) => {
    if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
    } else {
      html.removeAttribute("data-theme");
    }
    // Update icon visibility
    updateThemeIcons(theme);
  };

  // Update theme icons visibility
  const updateThemeIcons = (theme) => {
    const sunIcons = document.querySelectorAll(".theme-icon--sun");
    const moonIcons = document.querySelectorAll(".theme-icon--moon");
    
    sunIcons.forEach(icon => {
      icon.style.opacity = theme === "light" ? "1" : "0";
      icon.style.transform = theme === "light" ? "scale(1)" : "scale(0.8)";
    });
    
    moonIcons.forEach(icon => {
      icon.style.opacity = theme === "dark" ? "1" : "0";
      icon.style.transform = theme === "dark" ? "scale(1)" : "scale(0.8)";
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    const currentTheme = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Show notification
    const themeName = newTheme === "dark" ? "Dark" : "Light";
    showNotification(`${themeName} mode enabled`, "success");
  };

  // Initialize theme on page load
  const initTheme = () => {
    const preferredTheme = getPreferredTheme();
    applyTheme(preferredTheme);
  };

  // Add event listeners to theme toggle buttons
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
  
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("click", toggleTheme);
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem("theme")) {
        // Always keep light theme as default, don't auto-switch to dark
        applyTheme("light");
      }
    });
  }

  // Initialize theme
  initTheme();

  /* ====== Telegram Bot Config ====== */
  const TELEGRAM_BOT_TOKEN = "8038122192:AAGVtehjkv-lxOCkgNNZB5q8IwdLZpPj8EY";
  const TELEGRAM_CHAT_IDS = [
    "5896415793",
    "1375977030",
    "1774211685",
    // Add new IDs here
  ];

  /* ====== Track Time on Site ====== */
  const pageLoadTime = Date.now();
  
  const getTimeOnSite = () => {
    const timeSpent = Date.now() - pageLoadTime;
    const seconds = Math.floor(timeSpent / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  /* ====== Get User Country ====== */
  let userCountry = "Detecting...";

  const fetchUserCountry = async () => {
    // Try several APIs for reliability
    const apis = [
      {
        url: "https://ip-api.com/json/?lang=en",
        parse: (data) => data.country ? `${data.country} (${data.countryCode})` : null
      },
      {
        url: "https://ipwho.is/",
        parse: (data) => data.country ? `${data.country} (${data.country_code})` : null
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        const data = await response.json();
        const country = api.parse(data);
        if (country) {
          userCountry = country;
          return;
        }
      } catch (error) {
        console.warn(`Country API failed: ${api.url}`, error);
      }
    }
    
    // Fallback: determine by browser language
    const lang = (navigator.language || "").toLowerCase();
    const countryMap = {
      "ru": "Russia (RU)",
      "en-us": "USA (US)",
      "en-gb": "United Kingdom (GB)",
      "uk": "Ukraine (UA)",
      "kk": "Kazakhstan (KZ)",
      "be": "Belarus (BY)",
      "de": "Germany (DE)",
      "fr": "France (FR)",
    };
    userCountry = countryMap[lang] || countryMap[lang.split("-")[0]] || `Unknown (${lang})`;
  };

  // Preload country on page load
  fetchUserCountry();

  /* ====== Notification System ====== */
  const showNotification = (message, type = "success") => {
    // Remove existing notification
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification__icon">${type === "success" ? "✓" : "✕"}</div>
      <div class="notification__content">
        <p class="notification__message">${message}</p>
      </div>
      <button class="notification__close" type="button">×</button>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add("is-visible");
    });

    // Close button
    notification.querySelector(".notification__close").addEventListener("click", () => {
      notification.classList.remove("is-visible");
      setTimeout(() => notification.remove(), 300);
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove("is-visible");
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  };

  /* ====== Send to Telegram ====== */
  const sendToTelegram = async (name, phone, formSource = "Website", telegram = "", instagram = "") => {
    const timeOnSite = getTimeOnSite();
    
    let socialInfo = "";
    if (telegram) socialInfo += `\n✈️ *Telegram:* ${telegram}`;
    if (instagram) socialInfo += `\n📷 *Instagram:* ${instagram}`;
    
    const text = `📩 *New Request from Website*

👤 *Name:* ${name}
📱 *Phone:* ${phone}${socialInfo}
📋 *Source:* ${formSource}
⏱️ *Time on site:* ${timeOnSite}
🌍 *Country:* ${userCountry}
🕐 *Submitted at:* ${new Date().toLocaleString("en-US")}`;

    // Send message to each recipient
    const sendToChat = async (chatId) => {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: text,
              parse_mode: "Markdown",
            }),
          }
        );
        const data = await response.json();
        return data.ok;
      } catch (error) {
        console.error(`Telegram send error to ${chatId}:`, error);
        return false;
      }
    };

    try {
      // Send to all recipients in parallel
      const results = await Promise.all(TELEGRAM_CHAT_IDS.map(sendToChat));
      // Success only if all messages sent
      return results.every((result) => result === true);
    } catch (error) {
      console.error("Telegram send error:", error);
      return false;
    }
  };

  /* ====== Form Validation Helpers ====== */
  const isValidName = (value) => /^[A-Za-zА-Яа-яЁё\u4e00-\u9fff\s-]{2,}$/.test(value.trim());
  
  const isValidPhone = (value, input) => {
    // If intl-tel-input exists, use its validation
    if (input && input.iti && typeof input.iti.isValidNumber === "function") {
      return input.iti.isValidNumber();
    }
    
    // Fallback validation
    const cleaned = value.trim();
    // Remove everything except digits
    const digitsOnly = cleaned.replace(/\D/g, "");
    
    // Minimum 5 digits in number
    if (digitsOnly.length < 5) return false;
    
    // Check that string doesn't contain letters
    if (/[a-zA-Zа-яА-ЯёЁ]/.test(cleaned)) return false;
    
    // Allow only digits, +, spaces, parentheses, hyphens
    if (!/^[\d\s()\-+]+$/.test(cleaned)) return false;
    
    return true;
  };

  const setFieldError = (input, message) => {
    if (!(input instanceof HTMLInputElement)) return;
    input.classList.add("is-invalid");
    const parent = input.closest("label") || input.parentElement;
    if (!parent) return;
    let error = parent.querySelector(".field-error");
    if (!error) {
      error = document.createElement("span");
      error.className = "field-error";
      parent.appendChild(error);
    }
    error.textContent = message;
  };

  /* ====== Handle Form Submit ====== */
  const handleFormSubmit = async (form, formSource) => {
    const nameInput = form.querySelector('input[name="name"]');
    const phoneInput = form.querySelector('input[name="phone"]');
    const telegramInput = form.querySelector('input[name="telegram"]');
    const instagramInput = form.querySelector('input[name="instagram"]');

    if (!nameInput || !phoneInput) return false;

    const name = nameInput.value.trim();
    const phone = phoneInput.iti ? phoneInput.iti.getNumber() : phoneInput.value.trim();
    const telegram = telegramInput ? telegramInput.value.trim() : "";
    const instagram = instagramInput ? instagramInput.value.trim() : "";

    // Name validation
    if (!name || !isValidName(name)) {
      showNotification("Please enter a valid name", "error");
      setFieldError(nameInput, "Enter a valid name");
      return false;
    }

    // Phone validation
    if (!phone || !isValidPhone(phoneInput.value, phoneInput)) {
      showNotification("Please enter a valid phone number", "error");
      setFieldError(phoneInput, "Enter a valid phone number");
      return false;
    }

    // Show loading state on button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    const success = await sendToTelegram(name, phone, formSource, telegram, instagram);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }

    if (success) {
      showNotification("Thank you! Your request has been sent successfully. We will contact you shortly.", "success");
      form.reset();
      
      // Close modal if form is inside one
      const modal = form.closest(".modal");
      if (modal) {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        if (window.location.hash) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
      return true;
    } else {
      showNotification("An error occurred while sending. Please try again later or call us.", "error");
      return false;
    }
  };

  /* ====== Burger Menu ====== */
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", () => {
      body.classList.toggle("nav-open");
    });

    primaryNav.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.matches("a")) {
        body.classList.remove("nav-open");
      }
    });
  }

  /* ====== Modals ====== */
  const modals = Array.from(document.querySelectorAll(".modal"));

  const closeModals = () => {
    modals.forEach((modal) => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    });
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const syncModalsWithHash = () => {
    const targetId = window.location.hash.slice(1);
    modals.forEach((modal) => {
      const isActive = modal.id === targetId;
      modal.classList.toggle("is-open", isActive);
      modal.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const closeBtn = target.closest("[data-close]");
    if (closeBtn) {
      event.preventDefault();
      event.stopPropagation();
      closeModals();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModals();
  });

  window.addEventListener("hashchange", syncModalsWithHash);
  syncModalsWithHash();

  /* ====== Smooth Scroll ====== */
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.length < 2) return;
    const id = href.slice(1);
    const targetEl = document.getElementById(id);
    if (!targetEl) return;
    
    // Skip smooth scroll for modals - let hashchange handle them
    if (targetEl.classList.contains("modal")) {
      return;
    }
    
    event.preventDefault();
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    body.classList.remove("nav-open");
  });

  /* ====== Typed Effect ====== */
  const typed = document.querySelector(".hero__typed");
  if (typed) {
    const words = (typed.getAttribute("data-words") || "")
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean);

    if (words.length > 0) {
      let wordIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let pauseEnd = 0;

      const typeSpeed = 70;      // Typing speed (ms per character)
      const deleteSpeed = 40;    // Deleting speed (faster)
      const pauseAfterWord = 1500; // Pause after typing complete word
      const pauseAfterDelete = 300; // Short pause before typing next word

      const tick = () => {
        const now = Date.now();
        
        // If we're in a pause, wait
        if (now < pauseEnd) {
          requestAnimationFrame(tick);
          return;
        }

        const word = words[wordIndex];

        if (!isDeleting) {
          // Typing
          charIndex++;
          typed.textContent = word.slice(0, charIndex);

          if (charIndex === word.length) {
            // Finished typing, pause then start deleting
            isDeleting = true;
            pauseEnd = now + pauseAfterWord;
          }
        } else {
          // Deleting
          charIndex--;
          typed.textContent = word.slice(0, charIndex);

          if (charIndex === 0) {
            // Finished deleting, move to next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            pauseEnd = now + pauseAfterDelete;
          }
        }

        const delay = isDeleting ? deleteSpeed : typeSpeed;
        setTimeout(tick, delay);
      };

      tick();
    }
  }

  /* ====== Reveal Animations ====== */
  const revealItems = document.querySelectorAll(".reveal, .reveal-item");
  if (revealItems.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  /* ====== Lightbox Gallery ====== */
  const initLightbox = () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.querySelector(".lightbox__image");
    const lightboxClose = document.querySelector(".lightbox__close");
    const lightboxPrev = document.querySelector(".lightbox__btn--prev");
    const lightboxNext = document.querySelector(".lightbox__btn--next");
    const lightboxCurrent = document.querySelector(".lightbox__current");
    const lightboxTotal = document.querySelector(".lightbox__total");
    const lightboxOverlay = document.querySelector(".lightbox__overlay");
    const lightboxCounter = document.querySelector(".lightbox__counter"); // Get counter wrapper

    // Store current gallery images
    let currentGalleryImages = [];
    let currentIndex = 0;

    // Function to collect images from a specific slider wrapper
    const collectImagesFromSlider = (sliderWrapper) => {
      const images = [];
      // Look for images in the slider track (which contains the actual gallery)
      const sliderTrack = sliderWrapper.querySelector(".slider__track");
      if (!sliderTrack) return images;

      // Iterate over immediate children of the slider track
      const trackItems = Array.from(sliderTrack.children);

      trackItems.forEach((item) => {
        if (item.tagName === "IMG") {
          images.push({
            src: item.src,
            alt: item.alt,
            type: "image",
            element: item
          });
        } else if (item.tagName === "VIDEO") {
          // Assuming video elements have a source tag inside
          const videoSource = item.querySelector("source");
          // Only push video if a source is available
          if (videoSource && videoSource.src) {
            images.push({
              src: videoSource.src,
              alt: item.getAttribute("aria-label") || "Video",
              type: "video",
              element: item
            });
          }
        }
      });

      return images;
    };

    // Function to open lightbox with specific slider wrapper
    const openLightbox = (sliderWrapper, clickedImage) => {
      // Collect images from this specific slider
      currentGalleryImages = collectImagesFromSlider(sliderWrapper);
      
      if (currentGalleryImages.length === 0) return;

      // Check if navigation is needed and show/hide arrows
      const isNavNeeded = currentGalleryImages.length > 1;
      
      if (lightboxPrev) lightboxPrev.style.display = isNavNeeded ? "flex" : "none";
      if (lightboxNext) lightboxNext.style.display = isNavNeeded ? "flex" : "none";
      
      // Find the index of the clicked image
      const clickedIndex = currentGalleryImages.findIndex(item => item.element === clickedImage);
      currentIndex = clickedIndex >= 0 ? clickedIndex : 0;

      // Update lightbox content
      updateLightboxContent();

      // Show lightbox
      lightbox.setAttribute("aria-hidden", "false");
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";

      // Log for debugging
      console.log(`Lightbox opened with ${currentGalleryImages.length} images from clicked gallery`);
    };

    // Function to update lightbox content
    const updateLightboxContent = () => {
      if (currentGalleryImages.length === 0) return;

      const item = currentGalleryImages[currentIndex];

      if (item.type === "image") {
        lightboxImage.src = item.src;
        lightboxImage.alt = item.alt;
        lightboxImage.style.display = "block";
      } else if (item.type === "video") {
        lightboxImage.src = item.src;
        lightboxImage.alt = item.alt;
        lightboxImage.style.display = "block";
      }

      // Show/hide counter and update values
      const isCounterNeeded = currentGalleryImages.length > 1;
      if (lightboxCounter) lightboxCounter.style.display = isCounterNeeded ? "flex" : "none";
      
      lightboxCurrent.textContent = currentIndex + 1;
      lightboxTotal.textContent = currentGalleryImages.length;
    };

    // Function to close lightbox
    const closeLightbox = () => {
      lightbox.setAttribute("aria-hidden", "true");
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      currentGalleryImages = [];
    };

    // Function to show next image
    const showNext = () => {
      if (currentGalleryImages.length === 0) return;
      currentIndex = (currentIndex + 1) % currentGalleryImages.length;
      updateLightboxContent();
    };

    // Function to show previous image
    const showPrev = () => {
      if (currentGalleryImages.length === 0) return;
      currentIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
      updateLightboxContent();
    };

    // Add click handlers to gallery images
    const addImageClickHandlers = () => {
      // Remove existing handlers to avoid duplicates
      document.querySelectorAll(".technology__gallery img, .patent__gallery img").forEach((img) => {
        img.removeEventListener("click", handleImageClick);
      });

      // Add new handlers
      document.querySelectorAll(".technology__gallery img, .patent__gallery img").forEach((img) => {
        img.addEventListener("click", () => handleImageClick(img));
      });
    };

    // Handle image click - find which slider wrapper it belongs to
    const handleImageClick = (clickedImg) => {
      // Find the slider wrapper that contains this image
      let sliderWrapper = clickedImg.closest(".technology__slider-wrapper");
      
      // If not found in technology slider, try patent slider
      if (!sliderWrapper) {
        sliderWrapper = clickedImg.closest(".patent__slider-wrapper");
      }

      if (sliderWrapper) {
        openLightbox(sliderWrapper, clickedImg);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (!lightbox.classList.contains("is-open")) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          showNext();
          break;
        case "ArrowLeft":
          showPrev();
          break;
      }
    };

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left - next image
          showNext();
        } else {
          // Swipe right - previous image
          showPrev();
        }
      }
    };

    // Event listeners
    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightboxOverlay) {
      lightboxOverlay.addEventListener("click", closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", showPrev);
    }

    if (lightboxNext) {
      lightboxNext.addEventListener("click", showNext);
    }

    document.addEventListener("keydown", handleKeyDown);

    // Add touch event listeners to lightbox image
    if (lightboxImage) {
      lightboxImage.addEventListener("touchstart", handleTouchStart, { passive: true });
      lightboxImage.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    // Initialize click handlers
    addImageClickHandlers();

    // Log initialization for debugging
    console.log("Lightbox initialized - will show images from clicked gallery only");

    // Expose functions for testing/debugging
    window.closeLightbox = closeLightbox;
  };

  /* ====== Slider ====== */
  document.querySelectorAll(".slider").forEach((slider) => {
    const track = slider.querySelector(".slider__track");
    const wrapper = slider.closest(".technology__slider-wrapper") || slider.closest(".patent__slider-wrapper") || slider.parentElement;
    const prev = wrapper?.querySelector(".slider__btn--prev") || slider.querySelector(".slider__btn--prev");
    const next = wrapper?.querySelector(".slider__btn--next") || slider.querySelector(".slider__btn--next");
    const videos = Array.from(slider.querySelectorAll("video"));
    const items = track?.children;

    if (!(track instanceof HTMLElement) || !items || items.length === 0) return;

    let currentIndex = 0;
    const totalItems = items.length;
    let autoPlayUsed = false;

    const isVideoPlaying = (video) => video && !video.paused && !video.ended;

    const pauseAllVideos = () => {
      videos.forEach((video) => {
        if (!video.paused) {
          video.pause();
        }
      });
    };

    // Add event listeners to make videos loop when they end
    videos.forEach((video) => {
      video.addEventListener("ended", () => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });
    });

    const goToSlide = (index, autoPlayNext = false) => {
      const wasFirstVideoPlaying = currentIndex === 0 && videos[0] && isVideoPlaying(videos[0]);
      const isStacked = slider.classList.contains('slider--stacked');
      const oldIndex = currentIndex;
      
      pauseAllVideos();
      
      // Loop around
      if (index < 0) {
        currentIndex = totalItems - 1;
      } else if (index >= totalItems) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }
      
      if (isStacked) {
        updateStackedSlides(slider, currentIndex, oldIndex);
      } else {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      // Auto-play video 2 if switching from video 1 while it was playing (only once)
      if (autoPlayNext && wasFirstVideoPlaying && currentIndex === 1 && videos[1] && !autoPlayUsed) {
        autoPlayUsed = true;
        setTimeout(() => {
          videos[1].play().catch(() => {});
        }, 450);
      }
    };

    // Function to handle stacked slides animation
    const updateStackedSlides = (sliderEl, activeIdx, prevIdx) => {
      const slideItems = Array.from(sliderEl.querySelectorAll(".slider__track > *"));
      
      slideItems.forEach((item, i) => {
        // Clear all states first
        item.classList.remove('is-active', 'is-next', 'is-next-next', 'is-leaving');
        
        if (i === activeIdx) {
          item.classList.add('is-active');
        } else if (i === prevIdx && prevIdx !== activeIdx) {
          // Slide that is moving away
          item.classList.add('is-leaving');
        } else if (i === (activeIdx + 1) % totalItems) {
          // Peek 1
          item.classList.add('is-next');
        } else if (i === (activeIdx + 2) % totalItems) {
          // Peek 2
          item.classList.add('is-next-next');
        }
      });
    };

    // Add click event listeners to buttons with proper error handling
    if (prev) {
      prev.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Prev button clicked - slider:", slider);
        goToSlide(currentIndex - 1, false);
      });
    }

    if (next) {
      next.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Next button clicked - slider:", slider);
        goToSlide(currentIndex + 1, true);
      });
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left - next slide
          goToSlide(currentIndex + 1, true);
        } else {
          // Swipe right - previous slide
          goToSlide(currentIndex - 1, false);
        }
      }
    }, { passive: true });

    // Initialize
    track.style.transition = "transform 0.4s ease";
    goToSlide(0);
    
    // Log initialization for debugging
    console.log("Slider initialized:", {
      hasPrev: !!prev,
      hasNext: !!next,
      wrapper: wrapper?.className,
      items: totalItems
    });
  });

  /* ====== Form Validation (additional helpers) ====== */
  const clearFieldError = (input) => {
    if (!(input instanceof HTMLInputElement)) return;
    input.classList.remove("is-invalid");
    const parent = input.closest("label") || input.parentElement;
    if (!parent) return;
    const error = parent.querySelector(".field-error");
    if (error) error.remove();
  };

  const validateRadioGroup = (form, name) => {
    const group = Array.from(form.querySelectorAll(`input[name="${name}"]`));
    if (group.length === 0) return true;
    const isChecked = group.some((input) => input.checked);
    const fieldset = group[0].closest("fieldset");
    if (!fieldset) return isChecked;
    fieldset.classList.toggle("is-invalid", !isChecked);
    let error = fieldset.querySelector(".field-error");
    if (!isChecked) {
      if (!error) {
        error = document.createElement("span");
        error.className = "field-error";
        fieldset.appendChild(error);
      }
      error.textContent = "Please select an option";
    } else if (error) {
      error.remove();
    }
    return isChecked;
  };

  const attachFormValidation = (form) => {
    form.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      clearFieldError(target);
    });

    form.addEventListener("submit", (event) => {
      let isValid = true;
      const inputs = Array.from(form.querySelectorAll('input[type="text"], input[type="tel"]'));
      inputs.forEach((input) => {
        if (input.type === "text" && !isValidName(input.value)) {
          setFieldError(input, "Enter a valid name");
          isValid = false;
        }
        if (input.type === "tel" && !isValidPhone(input.value, input)) {
          setFieldError(input, "Enter a valid phone number");
          isValid = false;
        }
      });

      if (form.classList.contains("calculator-form__body")) {
        const licenseValid = validateRadioGroup(form, "license");
        const marketingValid = validateRadioGroup(form, "marketing");
        if (!licenseValid || !marketingValid) isValid = false;
      }

      if (!isValid) event.preventDefault();
    });
  };

  document.querySelectorAll("form").forEach(attachFormValidation);

  /* ====== Form Submissions to Telegram ====== */
  // CTA Section Form
  const ctaForm = document.querySelector(".cta-section__form");
  if (ctaForm) {
    ctaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleFormSubmit(ctaForm, "CTA Form");
    });
  }

  // Modal Forms
  document.querySelectorAll(".modal__form").forEach((form) => {
    const modal = form.closest(".modal");
    const subtitle = modal?.querySelector(".modal__subtitle");
    const formSource = subtitle ? subtitle.textContent : "Modal window";
    
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleFormSubmit(form, formSource);
    });
  });

  // Calculator Form
  const calcForm = document.querySelector(".calculator-form__body");
  if (calcForm) {
    calcForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Get calculator values for context
      const license = calcForm.querySelector('input[name="license"]:checked')?.parentElement?.textContent?.trim() || "Not selected";
      const marketing = calcForm.querySelector('input[name="marketing"]:checked')?.value === "yes" ? "Yes" : "No";
      const workdays = calcForm.querySelector('input[name="workdays"]')?.value || "1";
      const services = calcForm.querySelector('input[name="services"]')?.value || "1";
      const resultYear = document.querySelector('.calculator-results__value--yearly')?.textContent || "";
      const resultMonth = document.querySelector('.calculator-results__value[data-result="month"]')?.textContent || "";
      
      const formSource = `Profitability Calculator
 📊 License: ${license}
 📢 Marketing: ${marketing}
 📅 Working days: ${workdays}
 🔧 Services per day: ${services}
 💰 Monthly Estimate: ${resultMonth}
 💰 Yearly Estimate: ${resultYear}`;
      
      await handleFormSubmit(calcForm, formSource);
    });
  }

  /* ====== Calculator Steps ====== */
  const calculatorForm = document.querySelector(".calculator-form__body");
  const progress = document.querySelector(".calculator-form__progress");
  const progressBar = document.querySelector(".calculator-form__progress-bar");
  const resultBox = document.querySelector(".calculator-form__result");
  const resultValue = document.querySelector(".calculator-form__result-value");
  const stepCurrent = document.querySelector(".calculator-form__step-current");
  const stepTotal = document.querySelector(".calculator-form__step-total");
  const stepCounter = document.querySelector(".calculator-form__counter");

  if (calculatorForm) {
    const steps = Array.from(calculatorForm.querySelectorAll(".calculator-form__step"));
    const introStep = calculatorForm.querySelector(".calculator-form__step--intro");
    const introIndex = introStep ? steps.indexOf(introStep) : -1;
    const prevBtn = calculatorForm.querySelector("[data-step-prev]");
    const nextBtn = calculatorForm.querySelector("[data-step-next]");
    const submitBtn = calculatorForm.querySelector("[data-step-submit]");
    const startBtn = calculatorForm.querySelector("[data-step-start]");
    const actions = calculatorForm.querySelector(".calculator-form__actions");
    const questionsWrapper = calculatorForm.querySelector(".calculator-form__questions");
    let currentStep = 0;

    const totalQuestions = introIndex >= 0 ? steps.length - 1 : steps.length;

    /* Range value displays */
    const rangeInputs = calculatorForm.querySelectorAll('input[type="range"]');
    rangeInputs.forEach((input) => {
      const valueDisplay = calculatorForm.querySelector(`[data-range-value="${input.name}"]`);
      if (valueDisplay) {
        valueDisplay.textContent = input.value;
        input.addEventListener("input", () => {
          valueDisplay.textContent = input.value;
          valueDisplay.classList.add("is-changing");
          setTimeout(() => valueDisplay.classList.remove("is-changing"), 200);
        });
      }
    });

    const updateProgressBar = () => {
      if (!progressBar) return;
      const questionIndex = introIndex === 0 ? Math.max(0, currentStep - 1) : currentStep;
      const percent = Math.max(5, Math.round(((questionIndex + 1) / totalQuestions) * 100));
      progressBar.style.width = `${percent}%`;
    };

    const formatMoney = (value) => new Intl.NumberFormat("en-US").format(value);

    const updateCalculatorResult = () => {
      const license = calculatorForm.querySelector('input[name="license"]:checked')?.value;
      const marketing = calculatorForm.querySelector('input[name="marketing"]:checked')?.value;
      const workdays = Number(calculatorForm.querySelector('input[name="workdays"]')?.value || 1);
      const services = Number(calculatorForm.querySelector('input[name="services"]')?.value || 1);

      // Current Step 4 result box (optional if still kept, but user wanted to replace section 5)
      if (resultBox && resultValue) {
        if (!license || !marketing) {
          resultBox.classList.add("is-hidden");
        } else {
          let revenue = 0;
          switch (license) {
            case "standard": revenue = 3000 * workdays * services; break;
            case "exclusive": revenue = 3500 * workdays * services; break;
            default: revenue = 2500 * workdays * services;
          }
          if (marketing === "no") revenue = Math.round(revenue * 0.7);
          
          resultValue.textContent = `€${formatMoney(revenue)}`;
          resultBox.classList.remove("is-hidden");
        }
      }

      // Populate Step 5 detailed results
      const resultsContainer = calculatorForm.querySelector('.calculator-results');
      if (resultsContainer && license && marketing) {
        let revenue = 0;
        switch (license) {
          case "standard": revenue = 3000 * workdays * services; break;
          case "exclusive": revenue = 3500 * workdays * services; break;
          default: revenue = 2500 * workdays * services;
        }
        if (marketing === "no") revenue = Math.round(revenue * 0.7);

        const resMonth = resultsContainer.querySelector('[data-result="month"]');
        const resMonth3 = resultsContainer.querySelector('[data-result="month3"]');
        const resMonth6 = resultsContainer.querySelector('[data-result="month6"]');
        const resYear = resultsContainer.querySelector('[data-result="year"]');

        if (resMonth) resMonth.textContent = `€${formatMoney(revenue)}`;
        if (resMonth3) resMonth3.textContent = `€${formatMoney(revenue * 3)}`;
        if (resMonth6) resMonth6.textContent = `€${formatMoney(revenue * 6)}`;
        if (resYear) resYear.textContent = `€${formatMoney(revenue * 12)}`;
      }
    };

    const showStep = (index, direction = 1) => {
      const currentStepEl = steps[currentStep];
      const nextStepEl = steps[index];

      // Add leaving animation to current step
      if (currentStepEl && currentStep !== index) {
        currentStepEl.style.animationDirection = direction > 0 ? "normal" : "reverse";
      }

      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
      });
      
      // Trigger confetti on Step 5 (index 5 if intro is 0)
      // Since steps are: 0:Intro, 1:License, 2:Marketing, 3:Days, 4:Services, 5:Results, 6:Contacts
      if (index === 5 && typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#842bff', '#a855f7', '#ffffff']
        });
      }

      currentStep = index;

      const isIntro = index === introIndex;
      const isLast = index === steps.length - 1;

      if (prevBtn) {
        prevBtn.toggleAttribute("disabled", index === 0);
        prevBtn.style.display = isIntro ? "none" : "inline-flex";
      }
      if (nextBtn) {
        nextBtn.toggleAttribute("disabled", isLast);
        nextBtn.style.display = isLast || isIntro ? "none" : "inline-flex";
        
        // Change text on Step 5 next button
        if (index === 5) {
          nextBtn.textContent = "Get Detailed Calculation";
        } else {
          nextBtn.textContent = "Next";
        }
      }
      if (submitBtn) {
        submitBtn.style.display = isLast ? "inline-flex" : "none";
      }
      if (actions) {
        actions.classList.toggle("is-hidden", isIntro);
      }
      if (stepCounter) {
        stepCounter.classList.toggle("is-hidden", isIntro);
      }
      if (progress) {
        progress.classList.toggle("is-hidden", isIntro);
      }
      if (questionsWrapper) {
        questionsWrapper.classList.toggle("is-visible", !isIntro);
      }
      if (stepCurrent) {
        const displayStep = introIndex === 0 ? Math.max(1, index) : index + 1;
        stepCurrent.textContent = String(displayStep);
      }
      if (stepTotal) {
        stepTotal.textContent = String(totalQuestions);
      }

      updateProgressBar();
      updateCalculatorResult();
    };

    const isStepValid = (index) => {
      const step = steps[index];
      if (!step) return false;
      if (step.classList.contains("calculator-form__step--intro")) return true;

      const inputs = Array.from(step.querySelectorAll("input"));
      const radios = inputs.filter((input) => input.type === "radio");

      if (radios.length > 0) {
        const valid = radios.some((input) => input.checked);
        if (!valid) validateRadioGroup(calculatorForm, radios[0].name);
        return valid;
      }

      // Step 5 (Results) has no inputs, always valid
      if (index === 5) return true;

      // Range inputs are always valid (have default value)
      const ranges = inputs.filter((input) => input.type === "range");
      if (ranges.length > 0) return true;

      // Contact fields - check if filled
      if (index === steps.length - 1) {
        const textInputs = inputs.filter((input) => input.type === "text" || input.type === "tel");
        return textInputs.every((input) => input.value.trim().length > 0);
      }

      return true;
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentStep > 0) {
          showStep(currentStep - 1, -1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (isStepValid(currentStep)) {
          showStep(Math.min(currentStep + 1, steps.length - 1), 1);
        } else {
          const firstInput = steps[currentStep]?.querySelector("input");
          firstInput?.focus();
        }
      });
    }

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const firstQuestionIndex = introIndex >= 0 ? introIndex + 1 : 0;
        showStep(firstQuestionIndex, 1);
      });
    }

    calculatorForm.addEventListener("input", () => {
      updateCalculatorResult();
      updateProgressBar();
    });

    calculatorForm.addEventListener("change", () => {
      updateCalculatorResult();
      updateProgressBar();
    });

    showStep(0);
  }

  // Benefit cards water ripple effect on click
  const benefitCards = document.querySelectorAll(".benefit-card");
  benefitCards.forEach((card) => {
    // Create glow element for each card
    const glow = document.createElement("span");
    glow.className = "benefit-card__glow";
    card.appendChild(glow);

    card.addEventListener("click", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createRipple(card, x - 50, y - 50);
    });

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = x + "px";
      glow.style.top = y + "px";
      glow.style.opacity = "1";
    });

    card.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });
  });

  function createRipple(container, x, y) {
    const ripple = document.createElement("span");
    ripple.className = "water-ripple";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    container.appendChild(ripple);
    
    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  }

  /* ====== Intl Tel Input ====== */
  const intlTelConfig = {
    separateDialCode: true,
    formatAsYouType: true,
    nationalMode: false,
    countrySearch: true,
    i18n: {
      searchPlaceholder: "Search country",
    },
    loadUtilsOnInit: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.6.0/build/js/utils.js",
    customPlaceholder: function(selectedCountryPlaceholder) {
      return selectedCountryPlaceholder.replace(/\d/g, "0");
    },
  };

  const ctaPhone = document.querySelector("#cta-phone");
  if (ctaPhone && window.intlTelInput) {
    const iti = window.intlTelInput(ctaPhone, {
      ...intlTelConfig,
      initialCountry: "us",
    });
    ctaPhone.iti = iti;
  }

  const modalPhone = document.querySelector("#modal-phone");
  if (modalPhone && window.intlTelInput) {
    const iti = window.intlTelInput(modalPhone, {
      ...intlTelConfig,
      initialCountry: "us",
    });
    modalPhone.iti = iti;
  }

  // Initialize intl-tel-input for all phone fields in tariff modal forms
  const tariffPhones = document.querySelectorAll(".modal__form input[type='tel']");
  tariffPhones.forEach((phone) => {
    if (phone.id === "modal-phone") return; // Already initialized above
    if (window.intlTelInput) {
      const iti = window.intlTelInput(phone, {
        ...intlTelConfig,
        initialCountry: "us",
      });
      phone.iti = iti;
    }
  });

  // Initialize intl-tel-input for calculator form phone field
  const calcPhone = document.querySelector(".calculator-form__contacts input[type='tel']");
  if (calcPhone && window.intlTelInput) {
    const iti = window.intlTelInput(calcPhone, {
      ...intlTelConfig,
      initialCountry: "us",
    });
    calcPhone.iti = iti;
  }

  // Initialize lightbox
  initLightbox();

  /* ====== Copy Email Functionality ====== */
  const copyEmailLinks = document.querySelectorAll(".js-copy-email");
  copyEmailLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const email = link.textContent.trim();
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showNotification("Email copied to clipboard", "success");
        }).catch((err) => {
          console.error("Could not copy text: ", err);
          showNotification("Failed to copy email", "error");
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showNotification("Email copied to clipboard", "success");
        } catch (err) {
          showNotification("Failed to copy email", "error");
        }
        document.body.removeChild(textArea);
      }
    });
  });
  }
})();
