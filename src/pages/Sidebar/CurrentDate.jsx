/*
=============================================================================================
Change Log ( -- YYYY-MM-DD : Name - Message)
 -- Version changes and event history
=============================================================================================

-- 2026-03-19 : Marcos - Added comment tracking
*/

// This component displays the current date in a simple format. Used in the sidebar.
function CurrentDate() {
  const date = new Date();

  // Helper function to get the ordinal suffix for a given day
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // Format the date as "Weekday, Month DayOrdinal Year"
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();

  return (
    <div>
      <p id="date">{`${weekday}, ${month} ${day}${getOrdinal(day)} ${year}`}</p>
    </div>
  );
}

export default CurrentDate;
