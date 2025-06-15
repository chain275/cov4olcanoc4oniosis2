function loadScripts() {
    const scripts = [
      "../assets/js/responsive.js",
      "../assets/js/include.js",
      "../assets/js/slideshow.js",
      "../assets/js/scripts.js",
      "../assets/js/ad-banner.js"
    ];
    
    let index = 0;
    
    function loadNextScript() {
      if (index >= scripts.length) return;
      
      const script = document.createElement('script');
      script.src = scripts[index];
      script.onload = () => {
        index++;
        loadNextScript();
      };
      script.onerror = (error) => {
        console.error(`Error loading ${scripts[index]}: ${error}`);
        index++;
        loadNextScript();
      };
      document.head.appendChild(script);
    }
    
    loadNextScript();
  }
  
  // Call the function to load all scripts
  loadScripts();