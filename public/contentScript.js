// Log to confirm script is loaded
console.log("Content script loaded");

// Create container for sidebar (hidden initially)
const sidebarContainer = document.createElement("div");
sidebarContainer.id = "echofy-sidebar";
sidebarContainer.style.position = "fixed";
sidebarContainer.style.top = "0";
sidebarContainer.style.right = "0";
sidebarContainer.style.width = "350px";
sidebarContainer.style.height = "100%";
sidebarContainer.style.backgroundColor = "#2B2D42"; // deep indigo
sidebarContainer.style.color = "#FFFFFF";
sidebarContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
sidebarContainer.style.transform = "translateX(100%)"; // hidden
sidebarContainer.style.transition = "transform 0.3s ease";
sidebarContainer.style.zIndex = 2147483647;
sidebarContainer.style.overflowY = "auto";
document.body.appendChild(sidebarContainer);

// Create floating bubble
const bubble = document.createElement("div");
bubble.id = "echofy-bubble";
bubble.style.position = "fixed";
bubble.style.bottom = "20px";
bubble.style.right = "20px";
bubble.style.width = "60px";
bubble.style.height = "60px";
bubble.style.backgroundColor = "#2B2D42"; // deep indigo
bubble.style.color = "#00FFF7"; // neon cyan
bubble.style.borderRadius = "50%";
bubble.style.display = "flex";
bubble.style.alignItems = "center";
bubble.style.justifyContent = "center";
bubble.style.cursor = "pointer";
bubble.style.zIndex = 2147483647;
bubble.style.boxShadow = "0 2px 6px rgba(0,0,0,0.5)";
bubble.style.fontSize = "28px";
bubble.style.transition = "transform 0.2s ease";
bubble.innerText = "🔍";

// Hover animation
bubble.addEventListener("mouseover", () => {
  bubble.style.transform = "scale(1.1)";
});
bubble.addEventListener("mouseout", () => {
  bubble.style.transform = "scale(1)";
});

// Toggle sidebar visibility
bubble.addEventListener("click", () => {
  if (sidebarContainer.style.transform === "translateX(0%)") {
    sidebarContainer.style.transform = "translateX(100%)"; // hide
  } else {
    sidebarContainer.style.transform = "translateX(0%)"; // show
  }
});

document.body.appendChild(bubble);

// Optional: Add placeholder content in sidebar
sidebarContainer.innerHTML = `
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h2 style="color:#00FFF7;">  ECHOFY  </h2>
    <p>Analyze selected text or articles here.</p>
    <button style="
      background-color: #00FFF7;
      border: none;
      color: #2B2D42;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
    ">Analyze</button>
  </div>
`;
