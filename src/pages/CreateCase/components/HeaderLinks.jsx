import { NavLink } from "react-router-dom";
import "./CreateCaseComponents.css";

const HeaderLinks = () => {
  return (
    <div className="nav-links">
      <NavLink to="/create-case">State of Florida</NavLink>

      <NavLink to="/open-cases">Remote</NavLink>
      <NavLink to="/open-cases">CI</NavLink>
      <NavLink to="/open-cases">UC</NavLink>
      <NavLink to="/open-cases">TAC</NavLink>
    </div>
  );
};

export default HeaderLinks;
