import { Suspense } from "react";
import { connection } from "next/server";
import { pool } from "@/lib/db";

export default function Home() {
  return (
    <main className="catalog">
      <nav className="topbar" aria-label="Site header">
        <a href="/" className="brand">
          <span className="brand-icon" aria-hidden="true">C.</span>
          <span>Coursebook<span className="brand-dot">.</span></span>
        </a>

        <span className="nav-label">ACADEMIC COURSE DIRECTORY</span>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <span className="eyebrow">EXPLORE. LEARN. GROW.</span>

          <h1>
            Your next chapter
            <br />
            <span>starts here.</span>
          </h1>

          <p className="hero-description">
            Discover your courses, meet your instructors, and find
            what comes next in your learning journey.
          </p>

          <a href="#courses" className="browse-button">
            Explore courses <span aria-hidden="true">↗</span>
          </a>
        </div>

        <aside className="student-card">
          <span className="student-label">STUDENT PROFILE</span>
          <div className="avatar" aria-hidden="true">MK</div>
          <h2>Moe Han Kyaw</h2>
          <p>Digital Innovation Technology</p>

          <div className="student-id">
            <span>Student ID</span>
            <strong>6703711</strong>
          </div>

          <div className="deployment">
            <span className="status-dot" />
            Deployed with Jenkins
          </div>
        </aside>
      </header>

      <section id="courses" className="courses-section">
        <Suspense
          fallback={
            <div className="loading-panel" role="status">
              Loading the course directory…
            </div>
          }
        >
          <Courses />
        </Suspense>
      </section>

      <footer className="footer">
        <a href="/" className="footer-brand">Coursebook.</a>
        <p>Built for a brighter next chapter.</p>
        <span>Next.js · MySQL · Docker · Jenkins</span>
      </footer>
    </main>
  );
}

async function Courses() {
  await connection();

  const [courses] = await pool.query(
    `SELECT c.id, c.code, c.title, c.credits, c.semester, c.seats,
            i.fullname AS instructor
     FROM courses c
     JOIN instructor i ON i.id = c.instructorId
     ORDER BY c.semester, c.code`
  );

  const totalCredits = courses.reduce(
    (total, course) => total + Number(course.credits || 0),
    0
  );

  const semesterCount = new Set(
    courses.map((course) => course.semester)
  ).size;

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span className="stat-number">
            {String(courses.length).padStart(2, "0")}
          </span>
          <div>
            <strong>Courses listed</strong>
            <span>Explore the directory</span>
          </div>
        </div>

        <div className="stat">
          <span className="stat-number">
            {String(totalCredits).padStart(2, "0")}
          </span>
          <div>
            <strong>Total credits</strong>
            <span>Across listed courses</span>
          </div>
        </div>

        <div className="stat">
          <span className="stat-number">
            {String(semesterCount).padStart(2, "0")}
          </span>
          <div>
            <strong>Semesters represented</strong>
            <span>Plan your learning journey</span>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <span className="section-kicker">THE DIRECTORY</span>
          <h2>Find your next course.</h2>
        </div>

        <span className="results-count">
          {courses.length} {courses.length === 1 ? "course" : "courses"}
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <h3>A new chapter is on its way.</h3>
          <p>Courses will appear here when they are added to the database.</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course, index) => (
            <article className="course-card" key={course.id}>
              <div className="card-top">
                <span className="course-code">{course.code}</span>
                <span className="course-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <p className="semester-label">SEMESTER {course.semester}</p>
              <h3>{course.title}</h3>

              <div className="course-details">
                <div>
                  <strong>{course.credits}</strong>
                  <span>Credits</span>
                </div>
                <div>
                  <strong>{course.seats}</strong>
                  <span>Seats</span>
                </div>
              </div>

              <div className="instructor">
                <span className="instructor-avatar" aria-hidden="true">
                  {course.instructor?.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div>
                  <span>YOUR INSTRUCTOR</span>
                  <strong>{course.instructor}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}