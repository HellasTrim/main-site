const logo = document.getElementById("logo");
const homepage = document.getElementById("home");

document.addEventListener("DOMContentLoaded", () => {
  const savedSort = localStorage.getItem("sortOption");
  const dropdown = document.getElementById("sort-options");
  const direction = localStorage.getItem("sortDirection") || "asc";
  if (dropdown && savedSort) {
    dropdown.value = savedSort;
  }
  updateSortButtonLabel(direction);
  renderGalleryData();
});


  // Home Page Item Expansion
  const items = document.querySelectorAll(".home-expander");

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Expand each item consecutively
          setTimeout(() => {
            entry.target.classList.add("expand");
          }, index * 100); // delay per item
          // obs.unobserve(entry.target); // optional: only trigger once
        }
      });
    }, {
      threshold: 0.2
    });

    items.forEach(item => observer.observe(item));



function onLoad()
{
  updateTabIndicator(0);
  cachedMaterialData = fetchMaterials();
}



// Controls hiding the top tab bar when scrolling down
let lastScrollY = window.scrollY;
let topTab = document.getElementById("topTab");
const scrollThreshold = 20; // pixels

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollDelta = Math.abs(currentScrollY - lastScrollY);

  // Only act if the scroll movement exceeds the threshold
  if (scrollDelta > scrollThreshold) {
    if (currentScrollY > lastScrollY) {
      // Scrolled down
      topTab.classList.add("hide");
    } else {
      // Scrolled up
      topTab.classList.remove("hide");
    }
    lastScrollY = currentScrollY;
  }
});

const placeholder = document.getElementById("logo-placeholder");
// Track scroll

homepage.addEventListener("scroll", () => {
  if(logo.classList.contains("centered") && !logo.classList.contains("force-transition"))
  {
    logo.classList.add("no-transition");
    scrollTimeout = setTimeout(() => {
      logo.classList.remove("no-transition");
    }, 10); // waits 10ms after scroll stops
  }
  updateLogoPosition();
});
window.addEventListener("resize", updateLogoPosition); // re-calculate on resize

function ResetLogoPosition()
{
  logo.classList.remove("no-transition");
  logo.classList.remove("centered");
  logo.style.top = "-10px";
}

// This runs every scroll tick
function updateLogoPosition() {
  if (currentPageIndex !== 0 || homepage.scrollTop > 450) {
    ResetLogoPosition();
    return;
  }
  else if(!logo.classList.contains("centered")){
    logo.classList.add("centered");
    logo.classList.add("force-transition");
    scrollTimeout = setTimeout(() => {
      logo.classList.remove("force-transition");
    }, 500); // waits 10ms after scroll stops
  }
  
  requestAnimationFrame(() => {
    const placeholderRect = placeholder.getBoundingClientRect();
    const containerRect = homepage.getBoundingClientRect();
    const relativeTop = placeholderRect.top - containerRect.top;
    logo.style.top = `${relativeTop}px`;
  });
}





let cachedMaterialData = null;
function fetchMaterials()
{
  if (cachedMaterialData) {
    return Promise.resolve(cachedMaterialData);
  }

  const sheetId = "1O4hX5SCPvuZlpnuyclbUibIe3RHv3tyjDFNwSSVGuj0";
  const apiKey = "AIzaSyDXTxYCsPWRlVyXz4ht2Mj1_PnaBJjs8P0";
  const sheetName = "Materials"

  const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

  return fetch(sheetUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => {
    const rows = data.values;
    const headers = rows[0];

    cachedGalleryData = rows.slice(1).map((row, index) => {
      let item = {};
      headers.forEach((header, i) => {
        item[header] = row[i] || "";
      });
      item.index = index; // Attach the original sheet row index (excluding header)
      return item;
    });

    return cachedGalleryData;
  });
}
let searchQuery = ""; // This is a variable for storing the search bar contents
// This function is used to render the array of materials from the API/Json file into the gallery page.
function renderGalleryData() 
{
  document.getElementById("gallery-container").innerHTML = "<p>Loading gallery...</p>";

  fetchMaterials()
    .then(galleryData => {
      galleryData = sortGalleryData(filterGalleryData(galleryData));

      let galleryHTML = "";
      galleryData.forEach(item => {
        galleryHTML += `
          <div class="gallery-item" onclick="viewGalleryItem(${item.index})">
            <div class="gallery-item-title">${item.title}</div>
            <div class="gallery-item-image">
              <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="gallery-item-description">${item.summary}</div>
            <div class="gallery-item-description"><b>Cost:</b> $${item.cost}/ft² &emsp;&emsp; <b>Material:</b> ${item.material}</div>
          </div>`;
      });

      document.getElementById("gallery-container").innerHTML = galleryHTML;
    })
    .catch(error => {
      document.getElementById("gallery-container").innerHTML = `<p>Error loading gallery: ${error.message}</p>`;
    });
}



// These functions are used to toggle and update the Ascending/Descending Toggle button
function toggleSort() {
  const current = localStorage.getItem("sortDirection") || "asc";
  const next = current === "asc" ? "desc" : "asc";
  localStorage.setItem("sortDirection", next);

  updateSortButtonLabel(next);
  renderGalleryData();
}
function updateSortButtonLabel(direction) {
  const button = document.getElementById("sort-toggle");
  if (button) {
    button.textContent = direction === "asc" ? "Ascending" : "Descending";
  }
}
// Ensures input to the search input is registered
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderGalleryData();
});
// This function is used to search for gallery materials
function filterGalleryData(data) {
  return data.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.summary.toLowerCase().includes(searchQuery.toLowerCase()) || item.keywords.toLowerCase().includes(searchQuery.toLowerCase()) || item.material.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
// This function is used to Sort Gallery Materials
function sortGalleryData(data){
  const sortOption = document.getElementById("sort-options")?.value || "material";
  const direction = localStorage.getItem("sortDirection") || "asc";
  switch (sortOption) {
    case "title":
      return data.sort((a, b) => {
        return direction === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      });
    case "cost":
      return data.sort((a, b) => {
        return direction === "asc" ? a.cost - b.cost : b.cost - a.cost;
      });
    case "material":
      return data.sort((a, b) => {
        return direction === "asc" ? a.material.localeCompare(b.material) : b.material.localeCompare(a.material);
      });
    case "color":
      return data.sort((a, b) => {
        return direction === "asc" ? hexToHue(a.color) - hexToHue(b.color) : hexToHue(b.color) - hexToHue(a.color);
      });
    default:
      return data; // no sorting
  }
}



const inspector = document.getElementById("gallery-inspector");
function viewGalleryItem(index){

  fetchMaterials().then(data => {
    const item = data[index];
    if (!item) {
      document.getElementById("item-details").innerHTML = `<p>Item not found.</p>`;
      return;
    }

    let detailHTML = `
      <h1>${item.title}</h1>
      <img src="${item.image}" alt="${item.title}" style="aspect-ratio: 1/1; width: 66%;"/>
      <p>${item.summary}</p>
      <div class="detail-text">
        <p><b>Cost:</b> $${item.cost}/ft²&emsp;&emsp;&emsp;&emsp;&emsp;<b>Material:</b> ${item.material}</p>
        <p>${item.description}</p>
      </div>
      <br>
      <div style="pointer-events: all;">
      Interested?&emsp;&emsp;
      <button id="material-interest-button" onclick="contactAboutItem(${index})" class="inspector-button" style="width: fit-content; font-weight: bolder; padding: 20px;">Let us know!</button>
      </div>
    `;

    document.getElementById("item-details").innerHTML = detailHTML;
  });

  
  inspector.classList.add("visible");
  inspector.classList.remove("hidden");
}
// Closing the Inspector
function closeInspector() {
  inspector.classList.remove("visible");
  inspector.classList.add("hidden");
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeInspector();
  }
});
inspector.addEventListener("click", (e) => {
  const content = document.getElementById("inspector-content");
  if (!content.contains(e.target)) {
    closeInspector();
  }
});
const messageDiv = document.getElementById("message-input");
function contactAboutItem(index){
  fetchMaterials().then(data => {
    const item = data[index];
    if(!item)
    {
      return;
    }
    messageDiv.value = `Hello, I am interested in buying some ${item.title} flooring.`;
    messageDiv.classList.add("glowing");
    goToPage(4);
  })
}
messageDiv.addEventListener("mouseenter", (e) => {
  messageDiv.classList.remove("glowing");
});






// Color Conversion (for sorting by color)
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}
function rgbToHue({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const d = max - min;

  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }

  return h;
}
function hexToHue(hex)
{
  return rgbToHue(hexToRgb(hex));
}





// These functions are used to handle sliding between pages and for the tab indicator
const pages = [
  { id: "home"},
  { id: "gallery"},
  { id: "services"},
  { id: "about"},
  { id: "contact"}
];
let currentPageIndex = 0;
function goToPage(index, goToTop = false, skipStatePush = false) {
  updateTabIndicator(index)
  if(goToTop){
    const currentPage = document.getElementById(pages[index].id);
    currentPage.scrollTo({ top: 0, behavior: 'smooth' })
  }
  if (index === currentPageIndex || index < 0 || index >= pages.length) return;
  ResetLogoPosition();
  closeInspector();

  for(let i = 0; i < pages.length; i++)
  {
    const thisPage = document.getElementById(pages[i].id);
    const slide = (index - i) * -100;
    thisPage.style.left = `${slide}%`;
  }

  // Dynamic Slide Duration
  const distance = Math.abs(currentPageIndex - index);
  const duration = 0.3 + (0.1 * distance);
  document.querySelectorAll('.page').forEach(p => { 
    p.style.transition = `left ${duration}s ease`;
  });

  
  currentPageIndex = index;
  if(!skipStatePush)
  {
    history.pushState({ pageIndex: index }, "", `#${pages[index].id}`);
  }


  // Blur gallery when not tabbed in
  const galleryBlur = document.getElementById("gallery-overlay");
  galleryBlur.classList.add("galleryblur");
  // Check for special states
  switch(index)
  {
    case 0:
    {
      logo.classList.add("centered");
      updateLogoPosition();
      break;
    }
    case 1:
    {
      galleryBlur.classList.remove("galleryblur");
      renderGalleryData();
      break;
    }
    default:
      break;
  }
}
function updateTabIndicator(index) {
  const buttons = document.querySelectorAll(".tab");
  const indicator = document.getElementById("tab-indicator");

  const activeButton = buttons[index];
  const buttonRect = activeButton.getBoundingClientRect();
  const containerRect = activeButton.parentElement.getBoundingClientRect();

  const left = buttonRect.left - containerRect.left;
  const width = buttonRect.width;

  indicator.style.left = `${left}px`;
  indicator.style.width = `${width}px`;
}







const projectGallery = document.getElementById("project-gallery");
const projectGalleryContent = document.getElementById("project-gallery-contents");

function openProjectSlideshow()
{
  projectGallery.classList.remove("gallery");
  projectGallery.classList.remove("button");
  projectGallery.classList.add("slideshow");
  projectGallery.onclick = null;
  projectGalleryContent.innerHTML = 
  `
  <div class="cabinet transition" id="gallery-cabinet" style="gap: 5px; vertical-align: middle;">
    <div class="arrow-button" onclick="moveSlideshow(-1)">
      <img src="assets/images/arrow-icon.png" style="width:200%; transform: translate(-25%, -25%) scaleX(-1);">
    </div>
    <div class="slideshow">
      <div id="project-slider">

      </div>
    </div>
    <div class="arrow-button" onclick="moveSlideshow(1)">
      <img src="assets/images/arrow-icon.png" style="width:200%; transform: translate(-25%, -25%);">
    </div>
  </div>
  `;

  setupProjectSlideshow();
}

function openProjectPhotos(index)
{
  const viewer = document.getElementById("expanded-slide");
  const cabinet = document.getElementById("gallery-cabinet");
  const arrows = projectGalleryContent.querySelectorAll(".arrow-button");

  projectGallery.classList.remove("slideshow");
  projectGallery.classList.add("gallery");
  //viewer.classList.remove("button");

  cabinet.style.gap = 0;

  arrows.forEach(button => {
    button.classList.add("disabled");
  });
  
  const project = slideshowData[index];

  viewer.innerHTML = `
  <div class="bigslidecontainer">
    <div class="cabinet" style="height:fit-content; display: flex; width: 100%; justify-content: space-between;">
      <button onclick="closeProjectPhotos()">Close</button>
      <h2>${project.name}</h2>
      <div style="width: 75px"></div>
    </div>
    <img src="${project.photo}" alt="${project.name}" style="height:50%; border-radius: 15px;">
    <h3>${project.location}</h3>
  </div>`;
}

function closeProjectPhotos()
{
  // // const viewer = document.getElementById("project-viewer");
  // // const cabinet = document.getElementById("gallery-cabinet");
  const arrows = projectGalleryContent.querySelectorAll(".arrow-button");

  projectGallery.classList.add("slideshow");
  projectGallery.classList.remove("gallery");
  // // viewer.classList.add("button");

  // // cabinet.style.gap = "20px";

  arrows.forEach(button => {
    button.classList.remove("disabled");
  });
  // openProjectSlideshow();
}

function closeProjectSlideshow()
{

}

let slideshowCached = false;
let slideshowData = []
function setupProjectSlideshow()
{
  console.log("Slideshow setup called");
  fetchSlideshowData();
}
function fetchSlideshowData()
{
  fetch('gallery.json')
  .then(response => {
    if(!response.ok) throw new Error("Failed to load JSON");
    return response.json();
  })
  .then(data =>{
    slideshowData = data;
    constructSlideshow();
  })
  .catch(error =>{
    console.error("Error loading slideshow data", error);
  })
}
function constructSlideshow()
{
  const slider = document.getElementById("project-slider");
  slider.innerHTML = "";

  slideshowData.forEach((project, index) =>{
    const item = document.createElement("div");
    item.className = "button slideshow-item";
    item.innerHTML = `
    <div class="slidecontainer">
      <h2>${project.name}</h2>
      <img src="${project.photo}" alt="${project.name}" style="max-height:325px; width: 100%; border-radius: 15px;">
      <h3>${project.location}</h3>
    </div>`;

    item.addEventListener('click', () => {
      if(index === slideshowIndex){
        document.querySelectorAll('.slideshow-item').forEach(s => {
          if(s.id === 'expanded-slide') s.removeAttribute('id');
        });

        item.id = 'expanded-slide';
        openProjectPhotos(index);
      }
    })

    slider.appendChild(item);
  });

  updateSlideshowPos();
}

let slideshowIndex = 0;
function moveSlideshow(direction)
{
  slideshowIndex = (slideshowIndex + direction + slideshowData.length) % slideshowData.length;
  updateSlideshowPos();
}

function updateSlideshowPos()
{
  const items = document.querySelectorAll(".slideshow-item");
  items.forEach((item, i) => {
    let offset = (i - slideshowIndex + slideshowData.length) % slideshowData.length;
    if(offset > slideshowData.length / 2) offset -= slideshowData.length;
    item.style.left = `${offset * 100}%`;
    // item.style.zIndex = 10 - Math.abs(i - slideshowIndex);
  })
}

function resetSlideshow()
{
  slideshowIndex = 0;
  updateSlideshowPos();
}



const form = document.getElementById("input-form");
const responseDiv = document.getElementById("response-message");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form redirect
  sendFormMessage(e);
});

const inputs = form.querySelectorAll("input, textarea");
const submitButton = document.getElementById("send-message-button");
const overlay = document.getElementById("form-overlay");

inputs.forEach(input => {
  input.addEventListener("input", checkCanSendMessage);
})
function checkCanSendMessage(){
  const allRequiredSatisfied = Array.from(inputs).every(input => {
    if(input.hasAttribute("required")){
      return input.value.trim() !== "";
    }
    return true;
  })
  submitButton.disabled = !allRequiredSatisfied;
  if(allRequiredSatisfied) submitButton.classList.add("active");
  else submitButton.classList.remove("active");
}
function sendFormMessage(e)
{
  submitButton.classList.remove("active");
  submitButton.disabled = true;

  const form = e.target;
  const formData = new FormData(form);

  overlay.classList.add("vanilla-frost");
  responseDiv.textContent = "Sending Message...";

  fetch("https://script.google.com/macros/s/AKfycbyAyXcChCkTL1cE6qTESdH0Xz5tB7x7JAnOeUinrtGgAD9qOD-hmR8n6pkQcVu3nQSQ/exec", {
    method: "POST",
    body: formData,
  })
  .then((res) => res.text())
  .then((response) => {
    getMessageResponse("✅ " + response);
    form.reset();
  })
  .catch((err) => {
    getMessageResponse("❌ Error: " + err);
  });
}
// This confirms whether the message was received or not, either re-enabling the form
function getMessageResponse(string)
{
  responseDiv.textContent = string;
  setTimeout(() => {
    responseDiv.textContent = "";
    overlay.classList.remove("vanilla-frost")
  }, 1000)
}




// Back/Forward navigation
window.addEventListener("popstate", (event) => {
  let index;

  if (event.state && typeof event.state.pageIndex === "number") {
    index = event.state.pageIndex;
  } else {
    const hash = window.location.hash.slice(1);
    index = pages.findIndex(p => p.id === hash);
  }

  goToPage(index >= 0 ? index : 0, true);
});

// On load
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.slice(1); // remove #
  const pageIndex = pages.findIndex(p => p.id === hash);
  goToPage(pageIndex >= 0 ? pageIndex : 0);
});