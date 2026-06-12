import { useState, useRef, useEffect } from "react";

function FiltersBar({
  subjectSelected,
  setSubjectSelected,
  stageSelected,
  setStageSelected,
  sortSelected,
  setSortSelected,
  modeSelected,
  setModeSelected,
  subjects = [], // ✅ مهم جدًا
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const filtersRef = useRef();

  const stages = ["ابتدائي", "متوسط", "ثانوي"];
  const sorts = ["الأعلى تقييمًا", "الأقل سعرًا"];
  const modes = ["online", "offline"];

  useEffect(() => {
    function handleClickOutside(e) {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!openDropdown) return;

      let options = [];
      if (openDropdown === "subject") options = subjects;
      if (openDropdown === "stage") options = stages;
      if (openDropdown === "sort") options = sorts;
      if (openDropdown === "mode") options = modes;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0,
        );
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1,
        );
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const selected = options[highlightedIndex];
        if (openDropdown === "subject") setSubjectSelected(selected);
        if (openDropdown === "stage") setStageSelected(selected);
        if (openDropdown === "sort") setSortSelected(selected);
        if (openDropdown === "mode") setModeSelected(selected);
        setOpenDropdown(null);
      }
      if (e.key === "Escape") setOpenDropdown(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openDropdown, highlightedIndex, subjects]);

  const renderFilter = (label, selected, setSelected, options = [], type) => (
    <div
      className="filter-item"
      onClick={() => {
        setOpenDropdown(openDropdown === type ? null : type);
        setHighlightedIndex(0);
      }}
    >
      <span className={`selected ${!selected ? "placeholder" : ""}`}>
        {selected || label}
      </span>

      {selected && (
        <span
          className="clear-btn"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(null);
          }}
        >
          ✕
        </span>
      )}

      <span className={`arrow ${openDropdown === type ? "open" : ""}`}></span>

      {openDropdown === type && (
        <ul className="dropdown">
          {(options ?? []).map((opt, idx) => (
            <li
              key={idx}
              className={highlightedIndex === idx ? "active" : ""}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(opt);
                setOpenDropdown(null);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="filters-bar" ref={filtersRef}>
      {renderFilter(
        "فلترة حسب المادة",
        subjectSelected,
        setSubjectSelected,
        subjects,
        "subject",
      )}
      {renderFilter(
        "فلترة حسب المرحلة",
        stageSelected,
        setStageSelected,
        stages,
        "stage",
      )}
      {renderFilter(
        "طريقة التدريس",
        modeSelected,
        setModeSelected,
        modes,
        "mode",
      )}
      {renderFilter(
        "ترتيب حسب التميز",
        sortSelected,
        setSortSelected,
        sorts,
        "sort",
      )}
    </div>
  );
}

export default FiltersBar;
