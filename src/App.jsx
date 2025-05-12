import React, { useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import "./App.css";

const generateData = (rows) => {
  return Array.from({ length: rows }, (_, rowIndex) => ({
    id: rowIndex,
    cols: Array.from(
      { length: 14 },
      (_, colIndex) => `R${rowIndex + 1}C${colIndex + 1}`
    ),
  }));
};

function App() {
  const parentRef = useRef(null);
  const rowCount = 10000;
  const rowHeight = 35;
  const rowGap = 0;
  const stickyColumns = 4;
  const defaultColWidth = 150;
  const scrollColWidth = 150; // pevná šířka

  const [colWidth, setColWidth] = useState(defaultColWidth);
  const [isResizing, setIsResizing] = useState(false);

  const data = generateData(rowCount);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + rowGap,
    overscan: 5,
  });

  const stickyTotalWidth = stickyColumns * colWidth;

  const startResize = useCallback(
    (e) => {
      e.preventDefault();
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = colWidth;

      const onMouseMove = (moveEvent) => {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        setColWidth(Math.max(60, Math.min(newWidth, 400))); // rozumné meze
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [colWidth]
  );

  return (
    <div
      ref={parentRef}
      style={{
        padding: "20px",
        height: "500px",
        width: "1000px",
        overflow: "auto",
        border: "1px solid #ccc",
        position: "relative",
        willChange: "transform",
      }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: `${8 * colWidth}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = data[virtualRow.index];
          const sticky = row.cols.slice(0, stickyColumns);
          const scrollable = row.cols.slice(stickyColumns);

          return (
            <div
              key={row.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transform: `translateY(${virtualRow.start}px)`,
                display: "flex",
                width: "100%",
                height: rowHeight,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "max-content",
                  height: rowHeight,
                }}
              >
                {/* Sticky wrapper – drží všechny sticky buňky pohromadě */}
                <div
                  style={{
                    display: "flex",
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                  }}
                >
                  {sticky.map((cell, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#141414",
                        padding: "4px 8px",
                        border: "1px solid #ddd",
                        width: `${colWidth}px`,
                        height: "100%",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    >
                      {cell}
                    </div>
                  ))}
                </div>

                {/* Resizer – stále sticky */}
                <div
                  onMouseDown={startResize}
                  style={{
                    position: "sticky",
                    left: `${stickyTotalWidth}px`,
                    width: "5px",
                    height: "100%",
                    cursor: "col-resize",
                    background: isResizing ? "#888" : "#ccc",
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                />

                {/* Scrollovatelná část */}
                <div style={{ display: "flex" }}>
                  {scrollable.map((cell, i) => (
                    <div
                      key={i + stickyColumns}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #ddd",
                        width: `${scrollColWidth}px`,
                        height: "100%",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
