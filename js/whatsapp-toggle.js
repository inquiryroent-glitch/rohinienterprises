document.addEventListener('DOMContentLoaded', function() {
  // WhatsApp Toggle Functionality
  const whatsappToggle = document.getElementById('whatsappToggle');
  
  if (whatsappToggle) {
    whatsappToggle.addEventListener('click', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
    });

    // Close panel when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.whatsapp-toggle') && !e.target.closest('.whatsapp-panel')) {
        whatsappToggle.classList.remove('active');
      }
    });

    // Close panel when pressing Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        whatsappToggle.classList.remove('active');
      }
    });
  }
});
