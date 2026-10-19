import { useState } from "react";
import "./TabCard.css";

import Overview from "./tabs/Overview";
import VPN from "./tabs/VPN";
import Email from "./tabs/Email";

import mainIcon from "../../../images/home.png";
import infoIcon from "../../../images/vpn.png";
import emailIcon from "../../../images/mail.png";

const TabCard = ({ caseItem, setCaseItem }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      name: "Main",
      icon: mainIcon,
      component: <Overview caseItem={caseItem} />,
    },
    {
      name: "VPN Instruction",
      icon: infoIcon,
      component: <VPN caseItem={caseItem} />,
    },
    {
      name: "Email List",
      icon: emailIcon,
      component: <Email caseItem={caseItem} />,
    },
  ];

  return (
    <div className="tab-card">
      <div className="tab-header">
        {tabs.map((tab, index) => (
          <button
            key={tab.name}
            className={`tab-button ${activeTab === index ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            <img src={tab.icon} alt={tab.name} className="tab-icon" />
          </button>
        ))}
      </div>

      <div className="tab-content">{tabs[activeTab].component}</div>
    </div>
  );
};

export default TabCard;
