# Findify – The Intelligent Internship Hunter

**Findify** is the internship hunter that never sleeps.  
This project is an automated web scraper + dashboard system that continuously monitors your target companies for new internship opportunities, so you can focus on perfecting your applications instead of refreshing career pages.

## Key Features

- **Smart Web Scraping** – Automatically crawls career pages of companies you care about  
- **Scheduled Monitoring** – Set custom intervals to check for new postings  
- **Interactive Dashboard** – Beautiful web interface to view and manage opportunities  
- **Company Targeting** – Focus on specific companies instead of generic job boards  
- **Real-time Updates** – Get notified the moment new internships drop  
- **Persistent Storage** – Never lose track of discovered opportunities  

## Tech Stack

| Component   | Technology              | Description                                                                 |
|-------------|-------------------------|-----------------------------------------------------------------------------|
| Backend     | Python (FastAPI)        | High-performance, async-ready Python web framework for the API              |
| Frontend    | Next.js & React         | Server-side rendering and component-based UI development                   |
| Database    | SQLite                  | Simple, file-based relational database for data persistence                |
| Styling     | Tailwind CSS & Shadcn/ui| Utility-first CSS framework + reusable accessible components               |
| Icons       | Lucide React            | Clean, consistent, and beautiful open-source icons                         |

## Project Structure
* **`findify-backend/`**
    * **`app/`** (Contains core FastAPI application components)
        * `main.py` 
        * **`api/`** (REST API endpoints (routes))
        * **`data/`** (excel file to populate db when first starting dev)
        * **`db/`** (Database-related files)
        * **`notifications/`** (Logic for sending user notifications)
        * **`scheduler/`** (Task scheduling)
        * **`scraper/`** (main business logic for scraping job boards)
    * `inti_db.py`
    
* **`findify-frontend/`** (Next.js separate directory)
## Getting Started (Local Development)

### 1. Database Setup (SQLite)

Findify uses SQLite — a serverless, zero-configuration database.

1. *(Optional)* Install **[DB Browser for SQLite](https://sqlitebrowser.org/)** to view/edit the database file.
2. Initialize the database:

```bash
cd findify-backend
python init_db.py
```
This creates findify.db and sets up all required tables.

### 2. Backend Setup (FastAPI)
```
cd findify-backend

# Install Python dependencies
pip install -r requirements.txt

# create a .env file in
# → Edit the newly created .env file (ask the repo owner for required keys)

# Start the backend server (with auto-reload)
uvicorn app.main:app --reload
```
Backend API will be available at → http://127.0.0.1:8000

### 3. Frontend Setup (Next.js)
```
cd findify-frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

Frontend will be available at → http://localhost:3000


## Development Workflow

1. Create a new branch
2. Make your changes and test locally (both backend + frontend running)
3. Commit with clear messages
4. Push and open a Pull Request targeting the main branch on GitHub.
5. Request review (Tag or notify the repository owner)
