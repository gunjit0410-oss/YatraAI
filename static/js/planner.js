/**
 * YatraAI Interactive 5-Step Multi-Step Planner Engine
 */

document.addEventListener("DOMContentLoaded", function() {
    const plannerForm = document.getElementById("yatra-planner-form");
    if (!plannerForm) return;

    let currentStep = 1;
    const totalSteps = 5;
    let availableDestinations = { states: [], cities: [] };

    // Fetch dynamic database destinations for autocomplete
    fetch('/api/destinations/')
        .then(res => res.json())
        .then(data => {
            availableDestinations = data;
            setupAutocomplete();
        })
        .catch(err => console.warn("Failed to fetch dynamic destinations:", err));

    // Dynamic Autocomplete Setup
    const destInput = document.getElementById("dest-input");
    const suggestionBox = document.getElementById("dest-suggestions");

    function setupAutocomplete() {
        if (!destInput || !suggestionBox) return;

        destInput.addEventListener("input", function() {
            const val = this.value.trim().toLowerCase();
            suggestionBox.innerHTML = "";
            if (val.length < 1) {
                suggestionBox.style.display = "none";
                return;
            }

            const matchedStates = availableDestinations.states.filter(s => s.toLowerCase().includes(val));
            const matchedCities = availableDestinations.cities.filter(c => c.toLowerCase().includes(val));
            const matches = [...matchedStates, ...matchedCities].slice(0, 8);

            if (matches.length === 0) {
                suggestionBox.style.display = "none";
                return;
            }

            matches.forEach(item => {
                const div = document.createElement("div");
                div.className = "autocomplete-item";
                div.innerHTML = `<span><i class="fas fa-location-dot me-2 text-warning"></i>${item}</span><span class="badge bg-light text-muted">Select</span>`;
                div.addEventListener("click", function() {
                    destInput.value = item;
                    suggestionBox.style.display = "none";
                });
                suggestionBox.appendChild(div);
            });
            suggestionBox.style.display = "block";
        });

        document.addEventListener("click", function(e) {
            if (e.target !== destInput && e.target !== suggestionBox) {
                suggestionBox.style.display = "none";
            }
        });
    }

    // Quick State Selection Pills
    document.querySelectorAll(".quick-dest-pill").forEach(pill => {
        pill.addEventListener("click", function() {
            if (destInput) {
                destInput.value = this.dataset.dest;
            }
            document.querySelectorAll(".quick-dest-pill").forEach(p => p.classList.remove("active", "bg-warning", "text-dark"));
            this.classList.add("active", "bg-warning", "text-dark");
        });
    });

    // Single Selectable Option Cards (Travel Companion)
    document.querySelectorAll(".single-select-group").forEach(group => {
        const hiddenInput = group.querySelector("input[type='hidden']");
        group.querySelectorAll(".option-card-selectable").forEach(card => {
            card.addEventListener("click", function() {
                group.querySelectorAll(".option-card-selectable").forEach(c => c.classList.remove("selected"));
                this.classList.add("selected");
                if (hiddenInput) {
                    hiddenInput.value = this.dataset.value;
                }
            });
        });
    });

    // Multiple Selectable Option Cards (Interests)
    document.querySelectorAll(".multi-select-group .option-card-selectable").forEach(card => {
        card.addEventListener("click", function() {
            const checkbox = this.querySelector("input[type='checkbox']");
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    this.classList.add("selected");
                } else {
                    this.classList.remove("selected");
                }
            }
        });
    });

    // Budget Quick Presets
    document.querySelectorAll(".budget-preset-pill").forEach(pill => {
        pill.addEventListener("click", function() {
            const budgetInput = document.getElementById("budget-input");
            if (budgetInput) {
                budgetInput.value = this.dataset.value;
            }
        });
    });

    // Step Navigation Logic
    const btnNext = document.getElementById("btn-next-step");
    const btnPrev = document.getElementById("btn-prev-step");
    const stepCounterText = document.getElementById("step-counter-text");
    const stepProgressFill = document.getElementById("step-progress-fill");

    if (btnNext) {
        btnNext.addEventListener("click", function() {
            if (validateCurrentStep(currentStep)) {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                } else {
                    submitPlannerForm();
                }
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener("click", function() {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    }

    function goToStep(step) {
        currentStep = step;
        document.querySelectorAll(".wizard-step-content").forEach(el => el.classList.remove("active"));
        const targetContent = document.getElementById(`wizard-step-${step}`);
        if (targetContent) {
            targetContent.classList.add("active");
        }

        // Update progress bar UI
        const fillPercentage = (step / totalSteps) * 100;
        if (stepProgressFill) stepProgressFill.style.width = `${fillPercentage}%`;
        if (stepCounterText) stepCounterText.textContent = `STEP ${step} OF 5`;

        // Update Button Text & Styling
        if (btnNext) {
            if (step === totalSteps) {
                btnNext.innerHTML = `Create My Trip <i class="fas fa-arrow-right ms-2"></i>`;
                btnNext.className = "btn btn-warning btn-lg rounded-pill px-5 fw-bold text-dark shadow-lg";
            } else {
                btnNext.innerHTML = `Next Step <i class="fas fa-arrow-right ms-2"></i>`;
                btnNext.className = "btn btn-yatra btn-lg shadow-sm";
            }
        }

        if (btnPrev) {
            btnPrev.style.display = step === 1 ? "none" : "inline-block";
        }
    }

    function validateCurrentStep(step) {
        if (step === 1) {
            const dest = destInput ? destInput.value.trim() : "";
            if (!dest) {
                showYatraToast("Please enter or select a destination state/city.", "danger");
                destInput.focus();
                return false;
            }
        } else if (step === 3) {
            const bInput = document.getElementById("budget-input");
            if (bInput && (parseInt(bInput.value) < 1000 || isNaN(parseInt(bInput.value)))) {
                showYatraToast("Please enter a valid budget of at least ₹1,000.", "danger");
                return false;
            }
        } else if (step === 5) {
            const checkedInterests = document.querySelectorAll("input[name='interests']:checked");
            if (checkedInterests.length === 0) {
                showYatraToast("Please select at least one interest.", "danger");
                return false;
            }
        }
        return true;
    }

    function submitPlannerForm() {
        const overlay = document.getElementById("ai-loading-overlay");
        if (overlay) overlay.classList.add("active");
        plannerForm.submit();
    }
});
