/**
 * YatraAI Explore Page Interactivity Engine
 */

document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("explore-search-input");
    const categorySelect = document.getElementById("explore-category-select");
    const stateSelect = document.getElementById("explore-state-select");
    const placeCards = document.querySelectorAll(".explore-place-card-item");
    const resultCountBadge = document.getElementById("explore-count-badge");

    if (!searchInput && !categorySelect && !stateSelect) return;

    function filterCards() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const cat = categorySelect ? categorySelect.value.toLowerCase().trim() : "";
        const st = stateSelect ? stateSelect.value.toLowerCase().trim() : "";

        let visibleCount = 0;

        placeCards.forEach(card => {
            const cardName = (card.dataset.name || "").toLowerCase();
            const cardCity = (card.dataset.city || "").toLowerCase();
            const cardState = (card.dataset.state || "").toLowerCase();
            const cardCategory = (card.dataset.category || "").toLowerCase();
            const cardTags = (card.dataset.tags || "").toLowerCase();

            const matchesQuery = !query || cardName.includes(query) || cardCity.includes(query) || cardState.includes(query) || cardTags.includes(query);
            const matchesCat = !cat || cardCategory === cat;
            const matchesState = !st || cardState.includes(st);

            if (matchesQuery && matchesCat && matchesState) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (resultCountBadge) {
            resultCountBadge.textContent = visibleCount;
        }
    }

    if (searchInput) searchInput.addEventListener("input", filterCards);
    if (categorySelect) categorySelect.addEventListener("change", filterCards);
    if (stateSelect) stateSelect.addEventListener("change", filterCards);
});
