function WelcomeBar({ user }) {
  return (
    <section className="welcome-bar">
      <h1>أهلاً بك، {user.name}! 👋</h1>
      <p>
        لديك {user.lessonsThisWeek} دروس قائمة هذا الأسبوع، استمر في التقدم!
      </p>
    </section>
  );
}

export default WelcomeBar;