import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [touchPoint, setTouchPoint] = useState([0, 0]);

  const appRef = useRef<HTMLDivElement>();

  const touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault();

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientX;

    setTouchPoint([x, y]);
  };

  useEffect(() => {
    appRef.current?.addEventListener("touchmove", touchMoveHandler, {
      passive: false,
    });
  });

  return (
    <>
      <span id="zahyo">
        ({touchPoint[0]}, {touchPoint[1]})
      </span>
      <div id="box" ref={appRef}></div>
      <div id="filler" ref={appRef}></div>
    </>
  );
}

export default App;
