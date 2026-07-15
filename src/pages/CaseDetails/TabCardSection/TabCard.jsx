import { useState } from "react";
import "./TabCard.css";

import Overview from "./tabs/Overview";
import Details from "./tabs/Details";
import Parts from "./tabs/Parts";
import Invoices from "./tabs/Invoices";
import Email from "./tabs/Email";
import Attachments from "./tabs/Attachments";

import mainIcon from "../../../images/home.png";
import infoIcon from "../../../images/info.png";
import partIcon from "../../../images/tools.png";
import invoicesIcon from "../../../images/invoice.png";
import emailIcon from "../../../images/mail.png";
import attachmentsIcon from "../../../images/attach-file.png";

const TabCard = ({ caseItem, setCaseItem }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      name: "Main",
      icon: mainIcon,
      component: <Overview caseItem={caseItem} />,
    },
    {
      name: "IP Information",
      icon: infoIcon,
      component: <Details caseItem={caseItem} />,
    },
    {
      name: "Parts & Equipment",
      icon: partIcon,
      component: <Parts caseItem={caseItem} />,
    },
    {
      name: "Invoices",
      icon: invoicesIcon,
      component: <Invoices caseItem={caseItem} />,
    },
    {
      name: "Email List",
      icon: emailIcon,
      component: <Email caseItem={caseItem} />,
    },
    {
      name: "Attachments",
      icon: attachmentsIcon,
      component: <Attachments caseItem={caseItem} />,
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
