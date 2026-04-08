const paintings = [
  { id: 1, title: "Ved's Color Drift", mood: "Vibrant Flow", file: "arts/painting-01.jpg" },
  { id: 2, title: "Ved's River Echo", mood: "Calm Pulse", file: "arts/painting-02.jpg" },
  { id: 3, title: "Ved's Dawn Rhythm", mood: "Fresh Light", file: "arts/painting-03.jpg" },
  { id: 4, title: "Ved's Quiet Bloom", mood: "Soft Energy", file: "arts/painting-04.jpg" },
  { id: 5, title: "Ved's Golden Pause", mood: "Warm Glow", file: "arts/painting-05.jpg" },
  { id: 6, title: "Ved's Street Sonata", mood: "Urban Melody", file: "arts/painting-06.jpg" },
  { id: 7, title: "Ved's Monsoon Notes", mood: "Rain Memory", file: "arts/painting-07.jpg" },
  { id: 8, title: "Ved's Bold Horizon", mood: "Open Sky", file: "arts/painting-08.jpg" },
  { id: 9, title: "Ved's Sun Fragments", mood: "Radiant Layer", file: "arts/painting-09.jpg" },
  { id: 10, title: "Ved's Living Texture", mood: "Raw Detail", file: "arts/painting-10.jpg" },
  { id: 11, title: "Ved's City Mirage", mood: "Electric Calm", file: "arts/painting-11.jpg" },
  { id: 12, title: "Ved's Memory Garden", mood: "Floral Pulse", file: "arts/painting-12.jpg" },
  { id: 13, title: "Ved's Silent Lantern", mood: "Night Glow", file: "arts/painting-13.jpg" },
  { id: 14, title: "Ved's Ocean Breath", mood: "Tidal Drift", file: "arts/painting-14.jpg" },
  { id: 15, title: "Ved's Crimson Orbit", mood: "Fiery Motion", file: "arts/painting-15.jpg" },
  { id: 16, title: "Ved's Morning Terrace", mood: "Light Breeze", file: "arts/painting-16.jpg" },
  { id: 17, title: "Ved's Hidden Valley", mood: "Earth Tone", file: "arts/painting-17.jpg" },
  { id: 18, title: "Ved's Chroma Rain", mood: "Playful Burst", file: "arts/painting-18.jpg" },
  { id: 19, title: "Ved's Skyline Verse", mood: "Neon Air", file: "arts/painting-19.jpg" },
  { id: 20, title: "Ved's Sunset Geometry", mood: "Shape & Heat", file: "arts/painting-20.jpg" },
  { id: 21, title: "Ved's Indigo Silence", mood: "Deep Tone", file: "arts/painting-21.jpg" },
  { id: 22, title: "Ved's Morning Pulse", mood: "Bright Calm", file: "arts/painting-22.jpg" },
  { id: 23, title: "Ved's Earth Chorus", mood: "Organic Beat", file: "arts/painting-23.jpg" },
  { id: 24, title: "Ved's Soft Thunder", mood: "Charged Air", file: "arts/painting-24.jpg" },
  { id: 25, title: "Ved's Last Light", mood: "Evening Story", file: "arts/painting-25.jpg" }
];

const galleryGrid = document.getElementById("gallery-grid");
const yearNode = document.getElementById("year");

const cardMarkup = paintings
  .map((painting, index) => {
    const delay = index * 50;
    const number = String(painting.id).padStart(2, "0");

    return `
      <article class="art-card" style="animation-delay:${delay}ms">
        <div class="art-frame" data-missing="false">
          <img
            src="${painting.file}"
            alt="${painting.title} by Ved Sumeet Bub"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="art-body">
          <h3>${number}. ${painting.title}</h3>
          <p>${painting.mood}</p>
        </div>
      </article>
    `;
  })
  .join("");

galleryGrid.innerHTML = cardMarkup;

for (const frame of document.querySelectorAll(".art-frame")) {
  const image = frame.querySelector("img");
  image.addEventListener("error", () => {
    frame.dataset.missing = "true";
    image.remove();
  });
}

yearNode.textContent = new Date().getFullYear();
