document.addEventListener("DOMContentLoaded", () => {
    // GSAP ScrollTrigger setup
    gsap.registerPlugin(ScrollTrigger);
    const loader = document.querySelector(".loader");
    
    window.addEventListener("load", () => {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          loader.style.display = "none";
          document.body.style.overflow = "auto";
    
          // Animate hero section elements
          const heroTimeline = gsap.timeline();
          heroTimeline.to(".animate-text", {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
          });
        },
      });
    });
    
    document.getElementById("current-year").textContent = new Date().getFullYear();
    
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      const isExpanded = nav.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", isExpanded);
    
      const icon = menuToggle.querySelector("i");
      if (isExpanded) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });
    
    let lastScrollTop = 0;
    const header = document.querySelector(".header");
    
    window.addEventListener("scroll", () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.classList.add("hidden");
      } else {
        header.classList.remove("hidden");
      }
    
      lastScrollTop = scrollTop;
    });
    
    // Standard smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
    
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
    
        if (targetElement) {
          // Standard smooth scrolling
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
    
          // Close mobile menu if open
          if (nav.classList.contains("active")) {
            nav.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            const icon = menuToggle.querySelector("i");
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
          }
        }
      });
    });
    
    // Slideshow functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll(".slide");
    const indicators = document.querySelectorAll(".indicator");
    
    function showSlide(index) {
      slides.forEach((slide) => slide.classList.remove("active"));
      indicators.forEach((indicator) => indicator.classList.remove("active"));
    
      slides[index].classList.add("active");
      indicators[index].classList.add("active");
      currentSlide = index;
    }
    
    let slideInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
    
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        clearInterval(slideInterval);
        showSlide(index);
    
        // Restart auto-advance
        slideInterval = setInterval(() => {
          currentSlide = (currentSlide + 1) % slides.length;
          showSlide(currentSlide);
        }, 5000);
      });
    });
    
    // Scroll animations for sections
    gsap.utils.toArray(".reveal-section").forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    
    // Scroll animations for items within sections
    gsap.utils.toArray(".reveal-item").forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    
    // Favorites section
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const searchResults = document.getElementById("search-results");
    const favoritesGrid = document.getElementById("favorites-grid");
    const selectedCount = document.getElementById("selected-count");
    const clearSelectionBtn = document.getElementById("clear-selection");
    const removeSelectedBtn = document.getElementById("remove-selected");
    
    // Static favorites
    const staticFavorites = [
      {
        id: 1,
        name: "Breaking Bad",
        image: "./waltuh.jpg",
        summary:
          "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family's future.",
      },
      {
        id: 2,
        name: "The Sopranos",
        image: "./sopranos.avif",
        summary:
          "Tony Soprano, an Italian-American mafia head based in New Jersey, struggles to manage his family and criminal life and confides his affairs to his psychiatrist Jennifer Melfi.",
      },
      {
        id: 3,
        name: "True Detective",
        image: "./TD.jpg",
        summary:
          "Police officers and detectives around the USA are forced to face dark secrets about themselves and the people around them while investigating homicides.",
      },
    ];
    
    let favorites = [...staticFavorites];
    let selectedFavorites = [];
    renderFavorites();
    updateSelectedCount();
    
    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });
    
    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener("click", () => {
        selectedFavorites = [];
        updateSelectedCount();
        renderFavorites();
      });
    }
    
    // Remove selected button
    if (removeSelectedBtn) {
      removeSelectedBtn.addEventListener("click", () => {
        if (selectedFavorites.length === 0) return;
        
        // Don't remove static favorites (ids 1-3)
        const toRemove = selectedFavorites.filter(id => id > 3);
        
        if (toRemove.length > 0) {
          favorites = favorites.filter(show => !toRemove.includes(show.id));
          selectedFavorites = [];
          updateSelectedCount();
          renderFavorites();
          
          // Show removal animation
          gsap.to(".favorites-controls", {
            scale: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1
          });
        } else {
          // Shake the button if trying to remove static favorites
          gsap.to(removeSelectedBtn, {
            x: 5,
            duration: 0.1,
            repeat: 3,
            yoyo: true
          });
        }
      });
    }
    
    function updateSelectedCount() {
      if (selectedCount) {
        selectedCount.textContent = selectedFavorites.length;
        
        // Show/hide controls based on selection
        const controls = document.querySelector(".favorites-controls");
        if (controls) {
          if (selectedFavorites.length > 0) {
            controls.classList.add("active");
          } else {
            controls.classList.remove("active");
          }
        }
      }
    }
    
    async function performSearch() {
      const query = searchInput.value.trim();
      if (!query) return;
    
      searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      searchButton.disabled = true;
    
      try {
        const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
        const data = await response.json();
    
        renderSearchResults(data);
      } catch (error) {
        console.error("Error searching shows:", error);
        searchResults.innerHTML = '<p class="p-4 text-red-500">Error searching shows. Please try again.</p>';
      } finally {
        searchButton.innerHTML = '<i class="fas fa-search"></i>';
        searchButton.disabled = false;
      }
    }
    
    function renderSearchResults(results) {
      if (results.length === 0) {
        searchResults.innerHTML = '<p class="p-4">No results found. Try a different search term.</p>';
        searchResults.classList.add("active");
        return;
      }
    
      let html = "";
      results.forEach((item) => {
        const show = item.show;
        const isAlreadyAdded = favorites.some((fav) => fav.id === show.id);
    
        html += `
          <div class="search-item">
            <div class="search-item-info">
              <img src="${show.image?.medium || "https://via.placeholder.com/40x40"}" alt="${show.name}" class="search-item-image">
              <span class="search-item-title">${show.name}</span>
            </div>
            <button class="add-button" data-id="${show.id}" ${isAlreadyAdded ? "disabled" : ""}>
              <i class="fas ${isAlreadyAdded ? "fa-check" : "fa-plus"}"></i>
            </button>
          </div>
        `;
      });
    
      searchResults.innerHTML = html;
      searchResults.classList.add("active");
    
      // Animate search results appearance
      gsap.fromTo(searchResults, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    
      // Add event listeners to add buttons
      const addButtons = searchResults.querySelectorAll(".add-button");
      addButtons.forEach((button) => {
        if (!button.disabled) {
          button.addEventListener("click", function () {
            const showId = Number.parseInt(this.getAttribute("data-id"));
            const show = results.find((item) => item.show.id === showId).show;
    
            // Animate button when clicked
            gsap.to(this, {
              scale: 1.2,
              duration: 0.2,
              yoyo: true,
              repeat: 1,
              onComplete: () => {
                addToFavorites(show);
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-check"></i>';
              },
            });
          });
        }
      });
    }
    
    function addToFavorites(show) {
      if (!favorites.some((fav) => fav.id === show.id)) {
        favorites.push({
          id: show.id,
          name: show.name,
          image: show.image?.medium || "https://via.placeholder.com/210x295",
          summary: show.summary ? stripHtml(show.summary) : "No description available.",
        });
    
        renderFavorites();
      }
    }
    
    function removeFromFavorites(id) {
      // Don't allow removing static items (ids 1-3)
      if (id <= 3) return;
    
      favorites = favorites.filter((show) => show.id !== id);
      // Also remove from selected if it was selected
      selectedFavorites = selectedFavorites.filter(selectedId => selectedId !== id);
      updateSelectedCount();
      renderFavorites();
    }
    
    function toggleSelectFavorite(id) {
      const index = selectedFavorites.indexOf(id);
      
      if (index === -1) {
        selectedFavorites.push(id);
      } else {
        selectedFavorites.splice(index, 1);
      }
      
      updateSelectedCount();
      renderFavorites();
    }
    
    function renderFavorites() {
      let html = "";
    
      favorites.forEach((show) => {
        const isSelected = selectedFavorites.includes(show.id);
        
        html += `
          <div class="favorite-card ${isSelected ? 'selected' : ''}" data-id="${show.id}">
            <div class="favorite-image-container">
              <img src="${show.image}" alt="${show.name}" class="favorite-image">
              ${
                show.id > 3
                  ? `
                  <button class="remove-button" data-id="${show.id}" aria-label="Remove ${show.name}">
                    <i class="fas fa-times"></i>
                  </button>
                `
                  : ""
              }
            </div>
            <div class="favorite-content">
              <h3 class="favorite-title">${show.name}</h3>
              <p class="favorite-description">${show.summary}</p>
            </div>
          </div>
        `;
      });
    
      favoritesGrid.innerHTML = html;
    
      // Animate cards appearance with stagger
      const cards = favoritesGrid.querySelectorAll(".favorite-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          onComplete: () => {
            cards.forEach((card) => card.classList.add("show"));
          },
        }
      );
    
      const removeButtons = favoritesGrid.querySelectorAll(".remove-button");
      removeButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
          e.stopPropagation(); // Prevent card selection when removing
          const showId = Number.parseInt(this.getAttribute("data-id"));
          const card = this.closest(".favorite-card");
    
          // Animate card removal
          gsap.to(card, {
            opacity: 0,
            y: -20,
            scale: 0.9,
            duration: 0.3,
            onComplete: () => {
              removeFromFavorites(showId);
            },
          });
        });
      });
      
      cards.forEach(card => {
        card.addEventListener("click", function() {
          const showId = Number.parseInt(this.getAttribute("data-id"));
          toggleSelectFavorite(showId);
          
          // Animate selection
          gsap.to(this, {
            scale: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1
          });
        });
      });
    }
    
    function stripHtml(html) {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || "";
    }
    
    // Contact form validation
    const contactForm = document.getElementById("contact-form");
    const formSuccess = document.getElementById("form-success");
    const newMessageBtn = document.getElementById("new-message-btn");
    const submitBtn = document.getElementById("submit-btn");
    
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
    
      if (validateForm()) {
        submitBtn.textContent = "Submitting...";
        submitBtn.disabled = true;
    
        gsap.to(contactForm, {
          opacity: 0.7,
          scale: 0.98,
          duration: 0.3,
        });
    
        const formData = new FormData(contactForm);
        
        fetch('contact-form.php', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {

            gsap.to(contactForm, {
              display: "none",
              opacity: 0,
              duration: 0.3,
              onComplete: () => {
                formSuccess.style.display = "block";
                gsap.fromTo(
                  formSuccess,
                  { opacity: 0, scale: 0.9 },
                  { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
                );
              },
            });
          } else {
            if (data.errors) {
              for (const [field, message] of Object.entries(data.errors)) {
                showError(field, message);
              }
              // Shake form to indicate errors
              gsap.to(contactForm, {
                x: 10,
                duration: 0.1,
                repeat: 3,
                yoyo: true,
                ease: "power1.inOut",
              });
            } else {
              alert("Error: " + data.message);
            }
            submitBtn.textContent = "Submit";
            submitBtn.disabled = false;
            gsap.to(contactForm, { opacity: 1, scale: 1, duration: 0.3 });
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert("An error occurred: " + error.message);
          submitBtn.textContent = "Submit";
          submitBtn.disabled = false;
          gsap.to(contactForm, { opacity: 1, scale: 1, duration: 0.3 });
        });
      }
    });
    
    newMessageBtn.addEventListener("click", () => {
      gsap.to(formSuccess, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        onComplete: () => {
          formSuccess.style.display = "none";
          contactForm.style.display = "block";
          gsap.fromTo(contactForm, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5 });
          
          // Reset form
          contactForm.reset();
          clearErrors();
          submitBtn.textContent = "Submit";
          submitBtn.disabled = false;
        },
      });
    });
    
    function validateForm() {
      let isValid = true;
      clearErrors();
    
      // First Name validation
      const firstName = document.getElementById("firstName").value.trim();
      if (!firstName) {
        showError("firstName", "First name is required");
        isValid = false;
      }
    
      // Last Name validation
      const lastName = document.getElementById("lastName").value.trim();
      if (!lastName) {
        showError("lastName", "Last name is required");
        isValid = false;
      }
    
      // Email validation
      const email = document.getElementById("email").value.trim();
      if (!email) {
        showError("email", "Email is required");
        isValid = false;
      } else if (!isValidEmail(email)) {
        showError("email", "Please enter a valid email address");
        isValid = false;
      }
    
      // Comments validation
      const comments = document.getElementById("comments").value.trim();
      if (!comments) {
        showError("comments", "Comments are required");
        isValid = false;
      }
    
      // Shake form if there are errors
      if (!isValid) {
        gsap.to(contactForm, {
          x: 10,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          ease: "power1.inOut",
        });
      }
    
      return isValid;
    }
    
    function showError(fieldId, message) {
      const errorElement = document.getElementById(`${fieldId}-error`);
      const field = document.getElementById(fieldId);
    
      errorElement.textContent = message;
      field.classList.add("error");
    
      gsap.fromTo(errorElement, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
    
      // Highlight field with error
      gsap.to(field, {
        borderColor: "var(--red-500)",
        duration: 0.3,
      });
    }
    
    function clearErrors() {
      const errorElements = document.querySelectorAll(".error-message");
      errorElements.forEach((element) => {
        element.textContent = "";
      });
    
      const inputElements = contactForm.querySelectorAll("input, textarea");
      inputElements.forEach((element) => {
        element.classList.remove("error");
        gsap.to(element, { borderColor: "var(--gray-300)", duration: 0.3 });
      });
    }
    
    function isValidEmail(email) {
      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
    
    const formInputs = contactForm.querySelectorAll("input, textarea");
    formInputs.forEach((input) => {
      input.addEventListener("input", function () {
        const errorElement = document.getElementById(`${this.id}-error`);
        if (errorElement) {
          errorElement.textContent = "";
        }
        this.classList.remove("error");
    
        // Reset border color
        gsap.to(this, {
          borderColor: "var(--gray-300)",
          duration: 0.3,
        });
      });
    
      // Add focus animations
      input.addEventListener("focus", function () {
        gsap.to(this, {
          borderColor: "var(--primary-color)",
          duration: 0.3,
        });
      });
    
      input.addEventListener("blur", function () {
        if (!this.value) {
          gsap.to(this, {
            borderColor: "var(--gray-300)",
            duration: 0.3,
          });
        }
      });
    });
    
    // Parallax effect for background elements
    document.addEventListener("mousemove", (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
      gsap.to(".introduction::before, .introduction::after, .contact::before", {
        x: moveX,
        y: moveY,
        duration: 1,
        ease: "power1.out",
      });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: "power1.out",
        });
      });
    
      button.addEventListener("mouseleave", () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: "power1.out",
        });
      });
    });
});