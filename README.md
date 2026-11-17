# Cinema UI — 3D Projector Deck

A Video.js v10 skin that turns the player into a physical 3D projector console. Built for the [Video.js Skins Design Challenge](https://contra.com/community/topic/videojsskinschallenge) on Contra.

**Live Demo:** [https://videojs-cinema-ui.vercel.app](https://videojs-cinema-ui.vercel.app)

## What is Cinema UI?

The seek bar is not just a slider; it is the film itself. Every thumbnail is a real frame pulled from the Mux storyboard sprite sheet, laid out as a 35mm filmstrip with sprocket holes and an LED playhead. The room glows with the colour of the current scene, thanks to the ambient light effect driven by the storyboard frames.

The entire UI is a 3D plastic console: a thick bezel, a raised deck, tactile buttons, and a knurled metal jog dial. It feels like a real device, not a web page.

## Key Features

- **Filmstrip timeline** from real Mux storyboard frames (`TimeSlider`)
- **3D plastic console**: thick bezel, raised deck, tactile buttons, knurled metal jog dial
- **Countdown leader (3-2-1)** and a cinema curtain that opens when the film starts
- **Director's viewfinder** with 3D tilt, grid, timecode, and tap-to-focus
- **Hidden Easter egg**: press `C` three times for Film Noir mode
- **Ambient scene light**: the room takes the colour of the current scene
- **Fully accessible**: keyboard navigation, reduced-motion support, ARIA labels
- **Works on desktop and mobile**

## Tech Stack

- **Video.js v10** (`@videojs/react`)
- **Next.js** (App Router)
- **Tailwind CSS**
- **Mux** (video streaming and storyboard)
- **Pure CSS** (box-shadows, gradients, conic-gradients — no images, no libraries)

## How to Run Locally

```bash
# Clone the repository
git clone https://github.com/murokorepierrot/videojs-pro.git
cd videojs-pro

# Install dependencies
npm install

# Start the development server
npm run dev
