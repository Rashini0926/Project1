
import React from "react";
import Nav from "../../components/Nav/Nav";

function MainHome() {
  return (
    <div>
      <Nav />
      <main className="page">
        <h1>Dashboard</h1>
        <p>Welcome dashboard. (path: <code>/mainhome</code>)</p>
      </main>
    </div>
  );
}

export default MainHome;
