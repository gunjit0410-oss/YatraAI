/**
 * YatraAI Main Global Script
 */

document.addEventListener("DOMContentLoaded", function() {
    // Navbar Blur & Background Toggle on Scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-lg');
            } else {
                navbar.classList.remove('shadow-lg');
            }
        });
    }

    // Auto-dismiss Django Alert Banners after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});

/**
 * Shows a toast notification message dynamically in the UI
 */
function showYatraToast(message, type = 'info') {
    let container = document.getElementById('yatra-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'yatra-toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '10000';
        document.body.appendChild(container);
    }

    const toastId = 'toast_' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : (type === 'danger' ? 'bg-danger' : 'bg-dark');
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 rounded-3 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-semibold fs-6">
                    <i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-bell'} me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();
}
