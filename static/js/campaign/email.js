const isProUser = true;

const toggleBtnDiv = document.getElementById('toggleEditorBtn');
const toggleBtn = toggleBtnDiv.querySelector('button');
const quillEditor = document.getElementById('quill-wrapper');
const grapesjsEditor = document.getElementById('grapesjsEditor');
const proTag = document.getElementById('pro');

let editor;
//init pro edior
function initGrapesJSEditor() {
  if (editor) return; // Prevent double init

  editor = grapesjs.init({
      container: '#gjs',
      height: '100%',
      storageManager: false,
      fromElement: false,
      plugins: [
        'grapesjs-preset-newsletter',
        'grapesjs-blocks-basic-extend',
        'gjs-plugin-inline-styles',
      ],
      pluginsOpts: {
        'grapesjs-preset-newsletter': {},
        'grapesjs-blocks-basic-extend': {},
        'gjs-plugin-inline-styles': {
      onlyMatched: false, // Optional: set true to inline only matched styles
    },
      },
      blockManager: {
        appendTo: '#blocks',
      }
    });

    editor.on('load', () => {
      const bm = editor.BlockManager;


      bm.add('text-muted', {
  label: 'Muted Text',
  category: 'Text',
  attributes: { class: 'fa fa-low-vision' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:14px; color:#999; font-family: Arial, sans-serif;">
      Muted or secondary text.
    </td>
  </tr></table>`
});

              bm.add('layout-2-col', {
        label: '2 Columns',
        category: 'Layout',
        attributes: { class: 'fa fa-columns' },
        content: `
          <table style="width:100%;"><tr>
            <td style="width:50%; padding:10px;">Column 1</td>
            <td style="width:50%; padding:10px;">Column 2</td>
          </tr></table>
        `
      });

      bm.add('layout-3-col', {
        label: '3 Columns',
        category: 'Layout',
        attributes: { class: 'fa fa-table' },
        content: `
          <table style="width:100%;"><tr>
            <td style="width:33%; padding:10px;">Col 1</td>
            <td style="width:33%; padding:10px;">Col 2</td>
            <td style="width:33%; padding:10px;">Col 3</td>
          </tr></table>
        `
      });


//all of these are a block 
bm.add('layout-header', {
  label: 'Header',
  category: 'Layout',
  attributes: { class: 'fa fa-heading' },
  content: `
    <table style="width:100%; background:#eee;">
      <tr>
        <td style="padding:20px; text-align:center; font-size:24px;">
          <div data-gjs-editable="true">Header Title</div>
        </td>
      </tr>
    </table>
  `
});

bm.add('layout-footer', {
  label: 'Footer',
  category: 'Layout',
  attributes: { class: 'fa fa-shoe-prints' },
  content: `
    <table style="width:100%; background:#f2f2f2;">
      <tr>
        <td style="padding:20px; text-align:center; font-size:14px;">
          <div data-gjs-editable="true">Footer Text</div>
        </td>
      </tr>
    </table>
  `
});


      bm.add('layout-spacer-10', {
  label: 'Spacer 10px',
  category: 'Layout',
  attributes: { class: 'fa fa-arrows-alt-v' },
  content: `<table style="width:100%;"><tr><td style="height:10px; line-height:10px;">&nbsp;</td></tr></table>`
});

bm.add('layout-spacer-20', {
  label: 'Spacer 20px',
  category: 'Layout',
  attributes: { class: 'fa fa-arrows-alt-v' },
  content: `<table style="width:100%;"><tr><td style="height:20px; line-height:20px;">&nbsp;</td></tr></table>`
});

bm.add('layout-spacer-40', {
  label: 'Spacer 40px',
  category: 'Layout',
  attributes: { class: 'fa fa-arrows-alt-v' },
  content: `<table style="width:100%;"><tr><td style="height:40px; line-height:40px;">&nbsp;</td></tr></table>`
});

bm.add('layout-divider-thin', {
  label: 'Thin Divider',
  category: 'Layout',
  attributes: { class: 'fa fa-minus' },
  content: `<table style="width:100%;"><tr><td style="border-bottom:1px solid #ccc; padding:10px 0;">&nbsp;</td></tr></table>`
});

bm.add('layout-divider-thick', {
  label: 'Thick Divider',
  category: 'Layout',
  attributes: { class: 'fa fa-minus' },
  content: `<table style="width:100%;"><tr><td style="border-bottom:3px solid #999; padding:10px 0;">&nbsp;</td></tr></table>`
});

bm.add('layout-divider-dotted', {
  label: 'Dotted Divider',
  category: 'Layout',
  attributes: { class: 'fa fa-ellipsis-h' },
  content: `<table style="width:100%;"><tr><td style="border-bottom:1px dotted #bbb; padding:10px 0;">&nbsp;</td></tr></table>`
});

bm.add('layout-1-col', {
  label: '1 Column',
  category: 'Layout',
  attributes: { class: 'fa fa-columns' },
  content: `<table style="width:100%;"><tr><td style="padding:15px;">Content here</td></tr></table>`
});

bm.add('layout-2-col-30-70', {
  label: '2 Columns 30/70',
  category: 'Layout',
  attributes: { class: 'fa fa-columns' },
  content: `<table style="width:100%;"><tr>
              <td style="width:30%; padding:10px;">Col 1 (30%)</td>
              <td style="width:70%; padding:10px;">Col 2 (70%)</td>
            </tr></table>`
});

bm.add('layout-2-col-70-30', {
  label: '2 Columns 70/30',
  category: 'Layout',
  attributes: { class: 'fa fa-columns' },
  content: `<table style="width:100%;"><tr>
              <td style="width:70%; padding:10px;">Col 1 (70%)</td>
              <td style="width:30%; padding:10px;">Col 2 (30%)</td>
            </tr></table>`
});

bm.add('layout-3-col-25-50-25', {
  label: '3 Columns 25/50/25',
  category: 'Layout',
  attributes: { class: 'fa fa-table' },
  content: `<table style="width:100%;"><tr>
              <td style="width:25%; padding:10px;">Col 1</td>
              <td style="width:50%; padding:10px;">Col 2</td>
              <td style="width:25%; padding:10px;">Col 3</td>
            </tr></table>`
});

bm.add('layout-3-col-20-60-20', {
  label: '3 Columns 20/60/20',
  category: 'Layout',
  attributes: { class: 'fa fa-table' },
  content: `<table style="width:100%;"><tr>
              <td style="width:20%; padding:10px;">Col 1</td>
              <td style="width:60%; padding:10px;">Col 2</td>
              <td style="width:20%; padding:10px;">Col 3</td>
            </tr></table>`
});

bm.add('layout-4-col-equal', {
  label: '4 Columns Equal',
  category: 'Layout',
  attributes: { class: 'fa fa-th-large' },
  content: `<table style="width:100%;"><tr>
              <td style="width:25%; padding:10px;">Col 1</td>
              <td style="width:25%; padding:10px;">Col 2</td>
              <td style="width:25%; padding:10px;">Col 3</td>
              <td style="width:25%; padding:10px;">Col 4</td>
            </tr></table>`
});

bm.add('layout-section-wrapper', {
  label: 'Section Wrapper',
  category: 'Layout',
  attributes: { class: 'fa fa-square' },
  content: `<table style="width:100%; background:#f7f7f7; border:1px solid #ddd;">
              <tr><td style="padding:20px;">
                <table style="width:100%;"><tr><td>Nested content here</td></tr></table>
              </td></tr>
            </table>`
});

bm.add('layout-2-row-2-col', {
  label: '2 Rows 2 Columns',
  category: 'Layout',
  attributes: { class: 'fa fa-th-list' },
  content: `<table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="width:50%; padding:10px; border:1px solid #ddd;">Row 1, Col 1</td>
                <td style="width:50%; padding:10px; border:1px solid #ddd;">Row 1, Col 2</td>
              </tr>
              <tr>
                <td style="width:50%; padding:10px; border:1px solid #ddd;">Row 2, Col 1</td>
                <td style="width:50%; padding:10px; border:1px solid #ddd;">Row 2, Col 2</td>
              </tr>
            </table>`
});

bm.add('layout-3-row-1-col', {
  label: '3 Rows 1 Column',
  category: 'Layout',
  attributes: { class: 'fa fa-list-alt' },
  content: `<table style="width:100%; border-collapse:collapse;">
              <tr><td style="padding:10px; border:1px solid #ddd;">Row 1</td></tr>
              <tr><td style="padding:10px; border:1px solid #ddd;">Row 2</td></tr>
              <tr><td style="padding:10px; border:1px solid #ddd;">Row 3</td></tr>
            </table>`
});

bm.add('layout-nested-cols', {
  label: 'Nested Columns',
  category: 'Layout',
  attributes: { class: 'fa fa-columns' },
  content: `<table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="width:50%; padding:10px; border:1px solid #ddd;">
                  <table style="width:100%;"><tr>
                    <td style="width:50%; padding:5px;">Nested 1</td>
                    <td style="width:50%; padding:5px;">Nested 2</td>
                  </tr></table>
                </td>
                <td style="width:50%; padding:10px; border:1px solid #ddd;">Col 2</td>
              </tr>
            </table>`
});

bm.add('layout-offset-col', {
  label: 'Offset Column',
  category: 'Layout',
  attributes: { class: 'fa fa-indent' },
  content: `<table style="width:100%;"><tr>
              <td style="width:20%;">&nbsp;</td>
              <td style="width:80%; padding:10px;">Offset content</td>
            </tr></table>`
});

bm.add('layout-centered-narrow', {
  label: 'Centered Narrow Column',
  category: 'Layout',
  attributes: { class: 'fa fa-align-center' },
  content: `<table style="width:100%;"><tr>
              <td style="width:15%;"></td>
              <td style="width:70%; padding:10px; background:#eee;">Centered Content</td>
              <td style="width:15%;"></td>
            </tr></table>`
});

bm.add('layout-2-col-fixed', {
  label: '2 Columns Fixed 200/400px',
  category: 'Layout',
  attributes: { class: 'fa fa-columns' },
  content: `<table style="width:600px; max-width:100%;"><tr>
              <td style="width:200px; padding:10px;">Fixed 200px</td>
              <td style="width:400px; padding:10px;">Fixed 400px</td>
            </tr></table>`
});

bm.add('layout-3-col-fixed', {
  label: '3 Columns Fixed 150px',
  category: 'Layout',
  attributes: { class: 'fa fa-columns' },
  content: `<table style="width:450px; max-width:100%;"><tr>
              <td style="width:150px; padding:10px;">150px</td>
              <td style="width:150px; padding:10px;">150px</td>
              <td style="width:150px; padding:10px;">150px</td>
            </tr></table>`
});

bm.add('layout-full-width-padding', {
  label: 'Full Width + Padding',
  category: 'Layout',
  attributes: { class: 'fa fa-square' },
  content: `<table style="width:100%;"><tr>
              <td style="padding:30px;">Content with padding</td>
            </tr></table>`
});

bm.add('layout-bg-container', {
  label: 'Background Container',
  category: 'Layout',
  attributes: { class: 'fa fa-fill-drip' },
  content: `<table style="width:100%; background:#f0f0f0;"><tr>
              <td style="padding:20px;">Content inside colored container</td>
            </tr></table>`
});

bm.add('layout-highlight-col', {
  label: 'Highlight Column',
  category: 'Layout',
  attributes: { class: 'fa fa-paint-brush' },
  content: `<table style="width:100%;"><tr>
              <td style="width:50%; padding:10px; background:#ffebcc;"><div>Highlighted col</div></td>
              <td style="width:50%; padding:10px;"><div>Normal col</div></td>
            </tr></table>`
});

bm.add('text-header-large', {
  label: 'Header Large',
  category: 'Text',
  attributes: { class: 'fa fa-header' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:15px; font-size:28px; font-weight:bold; text-align:center; font-family: Arial, sans-serif;">
      <div>Large Header Text</div>
    </td>
  </tr></table>`
});

bm.add('text-header-medium', {
  label: 'Header Medium',
  category: 'Text',
  attributes: { class: 'fa fa-header' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:12px; font-size:22px; font-weight:bold; text-align:left; font-family: Arial, sans-serif;">
      <div>Medium Header Text</div>
    </td>
  </tr></table>`
});

bm.add('text-paragraph', {
  label: 'Paragraph',
  category: 'Text',
  attributes: { class: 'fa fa-paragraph' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:16px; line-height:1.5; font-family: Arial, sans-serif; color:#333;">
      <div>This is a sample paragraph. You can replace this text with your content.</div>
    </td>
  </tr></table>`
});

bm.add('text-small', {
  label: 'Small Text',
  category: 'Text',
  attributes: { class: 'fa fa-font' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:8px; font-size:12px; line-height:1.4; font-family: Arial, sans-serif; color:#666;">
      <div>Small text for disclaimers or footnotes.</div>
    </td>
  </tr></table>`
});

bm.add('text-center', {
  label: 'Centered Text',
  category: 'Text',
  attributes: { class: 'fa fa-align-center' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:16px; text-align:center; font-family: Arial, sans-serif; color:#333;">
      <div>Centered text block</div>
    </td>
  </tr></table>`
});

bm.add('text-right', {
  label: 'Right Aligned Text',
  category: 'Text',
  attributes: { class: 'fa fa-align-right' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:16px; text-align:right; font-family: Arial, sans-serif; color:#333;">
      <div>Right aligned text block</div>
    </td>
  </tr></table>`
});

bm.add('text-bold', {
  label: 'Bold Text',
  category: 'Text',
  attributes: { class: 'fa fa-bold' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:16px; font-weight:bold; font-family: Arial, sans-serif;">
      <div>Bold emphasized text.</div>
    </td>
  </tr></table>`
});

bm.add('text-italic', {
  label: 'Italic Text',
  category: 'Text',
  attributes: { class: 'fa fa-italic' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:16px; font-style:italic; font-family: Arial, sans-serif;">
      <div>Italic styled text.</div>
    </td>
  </tr></table>`
});

bm.add('text-link', {
  label: 'Text Link',
  category: 'Text',
  attributes: { class: 'fa fa-link' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:16px; font-family: Arial, sans-serif;">
      <div>Visit our <a href="#" style="color:#1a73e8; text-decoration:none;">website</a> for more info.</div>
    </td>
  </tr></table>`
});

bm.add('text-quote', {
  label: 'Blockquote',
  category: 'Text',
  attributes: { class: 'fa fa-quote-right' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:15px; font-size:16px; font-family: Arial, sans-serif; color:#666; border-left:4px solid #ccc; margin:0 10px;">
      <div>“This is a quoted text block with a left border.”</div>
    </td>
  </tr></table>`
});

bm.add('text-highlight', {
  label: 'Highlighted Text',
  category: 'Text',
  attributes: { class: 'fa fa-paint-brush' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:16px; background:#fffae6; font-family: Arial, sans-serif;">
      <div>Highlighted text for emphasis.</div>
    </td>
  </tr></table>`
});

bm.add('text-uppercase', {
  label: 'Uppercase Text',
  category: 'Text',
  attributes: { class: 'fa fa-text-height' },
  content: `<table style="width:100%;"><tr>
    <td style="padding:10px; font-size:14px; text-transform: uppercase; font-family: Arial, sans-serif; color:#444;">
      <div>Uppercase text block</div>
    </td>
  </tr></table>`
});





      // Remove default fullscreen and replace with custom fullscreen so the bliock button stays on the left while fullscreen
      const panel = editor.Panels;
      panel.removeButton('options', 'fullscreen');
      panel.removeButton('options', 'export-template'); // "View Code" button
      panel.removeButton('options', 'save'); 
      panel.removeButton('options', 'import');

panel.addButton('options', {
  id: 'custom-fullscreen',
  className: 'fa fa-arrows-alt', // matches GrapesJS icons
  command: 'custom-fullscreen',
  attributes: { title: 'Fullscreen' },
  togglable: true, // this makes it act like a toggle
  active: false    // default inactive
});


      editor.Commands.add('custom-fullscreen', {
        run() {
          const wrapper = document.getElementById('editor-wrapper');
          if (!document.fullscreenElement) {
            wrapper.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }
      });

      //Hide GrapesJS plusd add blocks button
      const hideOpenBlocksBtn = () => {
        const buttons = document.querySelectorAll('.gjs-pn-buttons .gjs-pn-btn svg path');
        buttons.forEach(path => {
          if (path.getAttribute('d') === 'M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z') {
            const btn = path.closest('.gjs-pn-btn');
            if (btn) btn.style.display = 'none';
          }
        });
      };

      setTimeout(hideOpenBlocksBtn, 500);
    });

    // Refresh layout when fullscreen toggles
    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => {
        editor.refresh();
        editor.refreshCanvas();
      }, 100);
    });
  }



let is_quill = true;
document.addEventListener('DOMContentLoaded', () => {
  if (isProUser) {
    toggleBtn.classList.remove('hidden');

    toggleBtn.addEventListener('click', () => {
      Toggle_quill()
    });
   

    // Init on load if default is Pro
    initGrapesJSEditor();
  } else {
    toggleBtnDiv.style.display = 'none';
    proTag.classList.add('hidden');
  }





});



// Get the HTML content from GrapesJS
function getEmailHtml() {
  if (!editor) {
    console.warn('Editor not initialized');
    return '';
  }

  // Use the inline styles plugin to extract clean, inline-styled HTML
  return editor.runCommand('gjs-get-inlined-html');
}




// Load HTML content into GrapesJS
function setEmailHtml(html) {
  if (!editor) {
    console.warn('Editor not initialized');
    return;
  }

  // Clear current editor content
  editor.DomComponents.clear();
  editor.CssComposer.clear();

  // Load raw HTML into GrapesJS
  editor.setComponents(html);

  // Optional: parse styles if you store them separately
  // editor.setStyle(css);
}


const template_section = document.getElementById('template_section');

//true for quill , false for graoe js
function Toggle_quill(bool = null) {
  let grapesVisible;
    if (bool === null ) {
      grapesVisible = !grapesjsEditor.classList.contains('hidden');
    }
    else {
      grapesVisible = bool;
    }

      if (grapesVisible) {
        is_quill = true;
        // Switch to Quill
        template_section.classList.add('hidden');
        grapesjsEditor.classList.add('hidden');
        quillEditor.classList.remove('hidden');
        proTag.classList.add('hidden');
        toggleBtn.innerHTML = `
          Use PRO Editor
          <span class="ml-3 inline-block bg-white bg-opacity-20 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-widest select-none">
            PRO
          </span>
        `;
        toggleBtn.classList.remove('bg-gray-800');
        toggleBtn.classList.add('bg-gradient-to-r', 'from-purple-700', 'via-pink-600', 'to-red-500');
        toggleBtn.setAttribute('aria-pressed', 'false');
      } else {
        // Switch to GrapesJS
        template_section.classList.remove('hidden');
        is_quill = false;
        grapesjsEditor.classList.remove('hidden');
        quillEditor.classList.add('hidden');
        proTag.classList.remove('hidden');

        // Init GrapesJS only once
        setTimeout(() => initGrapesJSEditor(), 50);

        toggleBtn.innerHTML = `
          Use Basic Editor
          <span class="ml-3 inline-block bg-white bg-opacity-20 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-widest select-none">
            BASIC
          </span>
        `;
        toggleBtn.classList.remove('bg-gradient-to-r', 'from-purple-700', 'via-pink-600', 'to-red-500');
        toggleBtn.classList.add('bg-gray-800');
        toggleBtn.setAttribute('aria-pressed', 'true');
      }
}








//template code here 

