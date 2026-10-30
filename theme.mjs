// Clear Skies is the selected product design. Legacy preferences and URL
// parameters intentionally cannot switch the application to another design.
document.documentElement.dataset.theme = 'clear-skies';
document.querySelector('.brand-icon img').src = 'brand-mark.svg';
document.querySelector('meta[name="theme-color"]').content = '#2563eb';
