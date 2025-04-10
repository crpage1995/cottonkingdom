fetch(chrome.runtime.getURL('corrections.json'))
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch corrections.json: ' + response.statusText);
    }
    return response.json();
  })
  .then(corrections => {
    console.log('Corrections loaded:', corrections);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      corrections.forEach(entry => {
        const { pattern, correction, source, image } = entry;
        const regex = new RegExp(pattern, 'gi');
        console.log("Looking for pattern:", pattern);
        if (regex.test(node.textContent)) {
          const span = document.createElement('span');
          span.innerHTML = node.textContent.replace(regex, match => {
            const infoId = 'annot-' + Math.random().toString(36).substr(2, 9);
            const imageHtml = image ? `<br><img src="${chrome.runtime.getURL(image)}" alt="Annotation image" style="max-width: 100%; margin-top: 0.5em;">` : '';
            return `
              <span style="background-color: #ffeb3b; cursor: pointer; position: relative;">
                ${match}
                <span class="annotation-popup" id="${infoId}" style="display:none; position:absolute; left:0; top:100%; background:#fff; border:1px solid #ccc; padding:0.5em; z-index:1000; width:300px;">
                  <strong>Correction:</strong> ${correction}<br>
                  <em>Source:</em> ${source}
                  ${imageHtml}
                </span>
              </span>
            `;
          });
          node.parentNode.replaceChild(span, node);
          span.addEventListener('click', function () {
            const popup = span.querySelector('.annotation-popup');
            popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
          });
        }
      });
    }
  })
  .catch(error => {
    console.error('Error loading corrections.json:', error);
  });
