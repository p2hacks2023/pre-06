import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [touchPoint, setTouchPoint] = useState([0, 0]);
  const touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault();

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientX;

    setTouchPoint([x, y]);
  };

  useEffect(() => {
    window.addEventListener("touchmove", touchMoveHandler, {
      passive: false,
    });
  });

  return (
    <>
      <div id="box"></div>
      <span id="zahyo">
        ({touchPoint[0]}, {touchPoint[1]})
      </span>
    </>
  );
}

export default App;
