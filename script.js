// Age Calculator Application
class AgeCalculator {
  constructor() {
    this.initializeElements();
    this.initializeTheme();
    this.attachEventListeners();
    this.initializeFeatherIcons();
    this.loadHistoryDisplay();
  }

  // Initialize DOM elements
  initializeElements() {
    this.themeToggle = document.getElementById("themeToggle");
    this.ageForm = document.getElementById("ageForm");
    this.dayInput = document.getElementById("dayInput");
    this.monthInput = document.getElementById("monthInput");
    this.yearInput = document.getElementById("yearInput");
    this.calculateBtn = document.getElementById("calculateBtn");

    // Error elements
    this.dayError = document.getElementById("dayError");
    this.monthError = document.getElementById("monthError");
    this.yearError = document.getElementById("yearError");
    this.formError = document.getElementById("formError");

    // Result elements
    this.resultsSection = document.getElementById("resultsSection");
    this.yearsDisplay = document.getElementById("yearsDisplay");
    this.monthsDisplay = document.getElementById("monthsDisplay");
    this.daysDisplay = document.getElementById("daysDisplay");
    this.totalDays = document.getElementById("totalDays");
    this.nextBirthday = document.getElementById("nextBirthday");

    // Action buttons
    this.actionButtons = document.getElementById("actionButtons");
    this.saveBtn = document.getElementById("saveBtn");
    this.clearBtn = document.getElementById("clearBtn");

    // History elements
    this.historySection = document.getElementById("historySection");
    this.historyList = document.getElementById("historyList");
    this.noHistory = document.getElementById("noHistory");
    this.clearAllBtn = document.getElementById("clearAllBtn");

    // Initialize history
    this.userHistory =
      JSON.parse(localStorage.getItem("ageCalculatorHistory")) || [];
    this.currentCalculation = null;
  }

  // Initialize Feather Icons
  initializeFeatherIcons() {
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  // Theme Management
  initializeTheme() {
    const savedTheme = localStorage.getItem("ageCalculatorTheme") || "light";
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ageCalculatorTheme", theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  // Event Listeners
  attachEventListeners() {
    this.themeToggle.addEventListener("click", () => this.toggleTheme());
    this.ageForm.addEventListener("submit", (e) => this.handleFormSubmit(e));

    // Real-time validation
    this.dayInput.addEventListener("input", () => this.validateDay());
    this.monthInput.addEventListener("change", () => this.validateMonth());
    this.yearInput.addEventListener("input", () => this.validateYear());

    // Clear errors on focus
    this.dayInput.addEventListener("focus", () => this.clearError("day"));
    this.monthInput.addEventListener("focus", () => this.clearError("month"));
    this.yearInput.addEventListener("focus", () => this.clearError("year"));

    // Action buttons
    this.saveBtn.addEventListener("click", () => this.showSaveModal());
    this.clearBtn.addEventListener("click", () => this.clearInputFields());

    // History actions
    this.clearAllBtn.addEventListener("click", () => this.clearAllHistory());
  }

  // Form Submission Handler
  handleFormSubmit(event) {
    event.preventDefault();

    if (this.validateAllInputs()) {
      this.performAgeCalculation();
    }
  }

  // Validation Methods
  validateAllInputs() {
    let isValid = true;

    if (!this.validateDay()) isValid = false;
    if (!this.validateMonth()) isValid = false;
    if (!this.validateYear()) isValid = false;

    if (isValid) {
      if (!this.validateDateCombination()) isValid = false;
    }

    return isValid;
  }

  validateDay() {
    const dayValue = parseInt(this.dayInput.value);

    if (!dayValue || dayValue < 1 || dayValue > 31) {
      this.showError("day", "Please enter a valid day (1-31)");
      return false;
    }

    this.clearError("day");
    return true;
  }

  validateMonth() {
    const monthValue = parseInt(this.monthInput.value);

    if (!monthValue || monthValue < 1 || monthValue > 12) {
      this.showError("month", "Please select a valid month");
      return false;
    }

    this.clearError("month");
    return true;
  }

  validateYear() {
    const yearValue = parseInt(this.yearInput.value);
    const currentYear = new Date().getFullYear();

    if (!yearValue || yearValue < 1900 || yearValue > currentYear) {
      this.showError(
        "year",
        `Please enter a year between 1900 and ${currentYear}`
      );
      return false;
    }

    this.clearError("year");
    return true;
  }

  validateDateCombination() {
    const day = parseInt(this.dayInput.value);
    const month = parseInt(this.monthInput.value);
    const year = parseInt(this.yearInput.value);

    // Check if the date exists
    const testDate = new Date(year, month - 1, day);
    if (
      testDate.getDate() !== day ||
      testDate.getMonth() !== month - 1 ||
      testDate.getFullYear() !== year
    ) {
      this.showFormError(
        "The entered date does not exist. Please check your input."
      );
      return false;
    }

    // Check if date is in the future
    const currentDate = new Date();
    if (testDate > currentDate) {
      this.showFormError(
        "Birth date cannot be in the future. Please enter a valid birth date."
      );
      return false;
    }

    this.clearFormError();
    return true;
  }

  // Age Calculation
  performAgeCalculation() {
    const birthDay = parseInt(this.dayInput.value);
    const birthMonth = parseInt(this.monthInput.value);
    const birthYear = parseInt(this.yearInput.value);

    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    const currentDate = new Date();

    const ageData = this.calculatePreciseAge(birthDate, currentDate);
    const additionalData = this.calculateAdditionalInfo(birthDate, currentDate);

    this.displayResults(ageData, additionalData);
  }

  calculatePreciseAge(birthDate, currentDate) {
    let years = currentDate.getFullYear() - birthDate.getFullYear();
    let months = currentDate.getMonth() - birthDate.getMonth();
    let days = currentDate.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  calculateAdditionalInfo(birthDate, currentDate) {
    // Calculate total days lived
    const timeDifference = currentDate.getTime() - birthDate.getTime();
    const totalDaysLived = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    // Calculate next birthday
    const nextBirthdayYear = currentDate.getFullYear();
    let nextBirthday = new Date(
      nextBirthdayYear,
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (nextBirthday < currentDate) {
      nextBirthday = new Date(
        nextBirthdayYear + 1,
        birthDate.getMonth(),
        birthDate.getDate()
      );
    }

    const daysUntilBirthday = Math.ceil(
      (nextBirthday - currentDate) / (1000 * 60 * 60 * 24)
    );

    return {
      totalDaysLived,
      daysUntilBirthday,
      nextBirthdayDate: nextBirthday,
    };
  }

  // Display Results
  displayResults(ageData, additionalData) {
    // Store current calculation data first
    const birthDay = parseInt(this.dayInput.value);
    const birthMonth = parseInt(this.monthInput.value);
    const birthYear = parseInt(this.yearInput.value);

    this.currentCalculation = {
      birthDate: { day: birthDay, month: birthMonth, year: birthYear },
      ageData,
      additionalData,
      calculatedDate: new Date().toISOString(),
    };

    // Animate numbers counting up
    this.animateNumber(this.yearsDisplay, 0, ageData.years, 1000);
    this.animateNumber(this.monthsDisplay, 0, ageData.months, 1200);
    this.animateNumber(this.daysDisplay, 0, ageData.days, 1400);

    // Update additional information
    setTimeout(() => {
      this.totalDays.textContent =
        additionalData.totalDaysLived.toLocaleString();

      if (additionalData.daysUntilBirthday === 0) {
        this.nextBirthday.textContent = "Today! 🎉";
      } else {
        const nextBirthdayFormatted = this.formatDate(
          additionalData.nextBirthdayDate
        );
        this.nextBirthday.textContent = `${additionalData.daysUntilBirthday} days (${nextBirthdayFormatted})`;
      }
    }, 800);

    // Show results section with animation
    setTimeout(() => {
      this.resultsSection.classList.add("show");
      this.actionButtons.style.display = "block";
    }, 100);
  }

  // Number Animation
  animateNumber(element, start, end, duration) {
    const startTime = performance.now();

    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(start + (end - start) * easeOutQuart);

      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = end;
      }
    };

    requestAnimationFrame(updateNumber);
  }

  // Utility Methods
  formatDate(date) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  showError(field, message) {
    const errorElement = this[`${field}Error`];
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }

  clearError(field) {
    const errorElement = this[`${field}Error`];
    errorElement.textContent = "";
    errorElement.classList.remove("show");
  }

  showFormError(message) {
    this.formError.textContent = message;
    this.formError.classList.add("show");
  }

  clearFormError() {
    this.formError.textContent = "";
    this.formError.classList.remove("show");
  }

  // History Management Methods
  showSaveModal() {
    if (!this.currentCalculation) return;

    const userName = prompt("Enter a name for this calculation:");
    if (userName && userName.trim()) {
      this.saveToHistory(userName.trim());
    }
  }

  saveToHistory(userName) {
    if (!this.currentCalculation) return;

    const historyItem = {
      id: Date.now(),
      name: userName,
      birthDate: this.currentCalculation.birthDate,
      ageData: this.currentCalculation.ageData,
      additionalData: this.currentCalculation.additionalData,
      savedDate: new Date().toISOString(),
    };

    this.userHistory.unshift(historyItem);
    this.saveHistoryToStorage();
    this.loadHistoryDisplay();
    this.clearInputFields();

    // Show success message
    this.showTemporaryMessage("Calculation saved successfully!", "success");
  }

  loadHistoryDisplay() {
    if (this.userHistory.length === 0) {
      this.noHistory.style.display = "block";
      this.historyList.innerHTML = "";
      this.historyList.appendChild(this.noHistory);
      return;
    }

    this.noHistory.style.display = "none";
    this.historyList.innerHTML = "";

    this.userHistory.forEach((item) => {
      const historyElement = this.createHistoryElement(item);
      this.historyList.appendChild(historyElement);
    });
  }

  createHistoryElement(item) {
    const historyDiv = document.createElement("div");
    historyDiv.className = "history-item";
    historyDiv.innerHTML = `
            <div class="history-content">
                <div class="history-name">${item.name}</div>
                <div class="history-details">
                    Age: ${item.ageData.years}y ${item.ageData.months}m ${
      item.ageData.days
    }d | 
                    Birth: ${item.birthDate.day}/${item.birthDate.month}/${
      item.birthDate.year
    }
                </div>
                <div class="history-date">Saved: ${this.getRelativeTime(
                  item.savedDate
                )}</div>
            </div>
            <div class="history-actions">
                <button class="history-btn use-btn" data-id="${
                  item.id
                }" title="Use this calculation">
                    <i data-feather="edit-3"></i>
                </button>
                <button class="history-btn delete-btn" data-id="${
                  item.id
                }" title="Delete this calculation">
                    <i data-feather="trash"></i>
                </button>
            </div>
        `;

    // Add event listeners
    const useBtn = historyDiv.querySelector(".use-btn");
    const deleteBtn = historyDiv.querySelector(".delete-btn");

    useBtn.addEventListener("click", () => this.useHistoryItem(item.id));
    deleteBtn.addEventListener("click", () => this.deleteHistoryItem(item.id));

    // Re-initialize feather icons for new elements
    setTimeout(() => {
      if (typeof feather !== "undefined") {
        feather.replace();
      }
    }, 100);

    return historyDiv;
  }

  useHistoryItem(itemId) {
    const item = this.userHistory.find((h) => h.id === itemId);
    if (!item) return;

    // Fill form with saved data
    this.dayInput.value = item.birthDate.day;
    this.monthInput.value = item.birthDate.month;
    this.yearInput.value = item.birthDate.year;

    // Recalculate to show current age
    this.performAgeCalculation();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    this.showTemporaryMessage("Calculation loaded successfully!", "success");
  }

  deleteHistoryItem(itemId) {
    if (confirm("Are you sure you want to delete this calculation?")) {
      this.userHistory = this.userHistory.filter((item) => item.id !== itemId);
      this.saveHistoryToStorage();
      this.loadHistoryDisplay();
      this.showTemporaryMessage("Calculation deleted successfully!", "success");
    }
  }

  clearAllHistory() {
    if (this.userHistory.length === 0) return;

    if (confirm("Are you sure you want to clear all saved calculations?")) {
      this.userHistory = [];
      this.saveHistoryToStorage();
      this.loadHistoryDisplay();
      this.showTemporaryMessage(
        "All calculations cleared successfully!",
        "success"
      );
    }
  }

  clearInputFields() {
    this.dayInput.value = "";
    this.monthInput.value = "";
    this.yearInput.value = "";

    // Clear errors
    this.clearError("day");
    this.clearError("month");
    this.clearError("year");
    this.clearFormError();

    // Hide results and action buttons
    this.resultsSection.classList.remove("show");
    this.actionButtons.style.display = "none";
    this.currentCalculation = null;

    // Focus on day input
    this.dayInput.focus();

    this.showTemporaryMessage("Fields cleared successfully!", "success");
  }

  saveHistoryToStorage() {
    localStorage.setItem(
      "ageCalculatorHistory",
      JSON.stringify(this.userHistory)
    );
  }

  getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  }

  showTemporaryMessage(message, type = "success") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `temp-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
            position: fixed;
            top: 5rem;
            right: 1rem;
            background: ${
              type === "success" ? "var(--success-color)" : "var(--error-color)"
            };
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            z-index: 1001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

    document.body.appendChild(messageDiv);

    // Animate in
    setTimeout(() => {
      messageDiv.style.opacity = "1";
      messageDiv.style.transform = "translateX(0)";
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      messageDiv.style.opacity = "0";
      messageDiv.style.transform = "translateX(100%)";
      setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const calculator = new AgeCalculator();

  // Add some interactive enhancements
  document.addEventListener("keydown", (e) => {
    // Allow Enter key to trigger calculation
    if (e.key === "Enter" && document.activeElement.tagName !== "BUTTON") {
      const form = document.getElementById("ageForm");
      if (form) {
        form.dispatchEvent(new Event("submit"));
      }
    }

    // Allow Escape key to clear results
    if (e.key === "Escape") {
      const resultsSection = document.getElementById("resultsSection");
      if (resultsSection && resultsSection.classList.contains("show")) {
        resultsSection.classList.remove("show");
      }
    }
  });

  console.log("Age Calculator initialized successfully! 🎂");
});

// Add some pleasant interactions
document.addEventListener("DOMContentLoaded", () => {
  // Add ripple effect to buttons
  const addRippleEffect = (element) => {
    element.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("ripple");

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  };

  // Add ripple CSS
  const style = document.createElement("style");
  style.textContent = `
        .calculate-btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            pointer-events: none;
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
  document.head.appendChild(style);

  const calculateBtn = document.getElementById("calculateBtn");
  if (calculateBtn) {
    addRippleEffect(calculateBtn);
  }
});
