# 🥤 Coca-Cola & Diet Coke E-Commerce Scroll Experience

Welcome to the **Coca-Cola E-Commerce & Interactive Scroll Website**. This project is a visually rich, responsive web application showcasing the refreshing feel of Coca-Cola and Diet Coke through custom scroll journeys, animations, a product purchase screen, and an admin view.

---

## 🚀 Live Demo & Hosting

The project is ready for immediate deployment on modern hosting providers. 

- **Static Hosting (Recommended):** Deploy to **Vercel** or **Netlify** for free with automatic CI/CD linked directly to your GitHub repository.
- **Docker Hosting:** Deploy to cloud container platforms like **Render**, **Railway**, or **DigitalOcean** using the included configuration.

---

## ✨ Features

- **Interactive Scroll Journey:** Seamless dark-themed product transitions and visual elements.
- **E-Commerce Purchase Portal (`buy.html`):** Clean and intuitive checkout layout for picking and purchasing your favorite Coke products.
- **Admin Dashboard (`admin.html`):** An administrative overview panel for management and statistics.
- **Diet Coke Portal (`diet-coke.html`):** A custom styled sub-page showcasing the light, crisp taste of Diet Coke.
- **Docker Containerized Setup:** Pre-configured Docker files to serve the static site using a highly optimized, lightweight **Nginx Alpine** image.
- **Dark Mode Support:** Fully tailored dark theme powered by Tailwind CSS.

---

## 🛠️ Technology Stack

* **Frontend Structure:** HTML5
* **Styling & Theme:** Tailwind CSS (via CDN) + Custom Vanilla CSS ([`style.css`](style.css))
* **Interactivity & Logic:** Vanilla JavaScript ([`script.js`](script.js))
* **Containerization:** Docker ([`Dockerfile`](Dockerfile)) & Docker Compose ([`docker-compose.yml`](docker-compose.yml))
* **Web Server:** Nginx Alpine (Containerized)

---

## 💻 Running the Project Locally

You can run this project in two ways:

### 1. Using Docker (Containerized)
This runs the exact website inside a lightweight Linux-based web server. No local Nginx/Apache installation is required.

* **Prerequisites:** Make sure you have **Docker Desktop** running.
* **Commands:**
  Open your terminal inside the project directory and run:
  ```bash
  docker compose up -d --build
  ```
* **Accessing the Site:** 
  Open your browser and navigate to: **[http://localhost:8080/](http://localhost:8080/)**
* **Live Reloading:** The compose file includes a volume mount (`.:/usr/share/nginx/html`). Any changes you make to your local HTML, CSS, or JS files will instantly reflect in the browser when you refresh!

To stop the container:
```bash
docker compose down
```

### 2. Without Docker (Direct static file serving)
Since this is a client-side static application, you can simply run it locally:
* Install the **Live Server** extension in VS Code and click "Go Live" at the bottom right.
* Or double-click the [`index.html`](index.html) file to open it directly in any browser.

---


## 📁 Repository Structure

```
.
├── admin.html               # Admin Dashboard Page
├── buy.html                 # E-Commerce Purchasing Screen
├── diet-coke.html           # Diet Coke Landing Page
├── index.html               # Main Coca-Cola Landing Page (Entrypoint)
├── script.js                # Core JS logic & dynamic layout interactions
├── style.css                # Custom visual enhancements & layout overrides
├── Dockerfile               # Production Docker Nginx config
├── docker-compose.yml       # Local development orchestrator
└── README.md                # Documentation (this file)
```
