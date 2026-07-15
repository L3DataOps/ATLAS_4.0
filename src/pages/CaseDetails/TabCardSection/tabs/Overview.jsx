import "./Tabs.css";

import OverviewCases from "./Overview_Cases";

const Overview = ({ caseItem }) => {
  return (
    <div className="overview-tab">
      <div className="overview-section">
        <div className="simple">
          <h4>Region</h4>
          <p>{caseItem.site?.region}</p>
        </div>
        <div className="simple">
          <h4>Network</h4>
          <p>{caseItem.site?.network}</p>
        </div>
        <div className="simple">
          <h4>City/County</h4>
          <p>
            {caseItem.site?.city} / {caseItem.site?.county}
          </p>
        </div>

        <div className="complex">
          <div className="simple">
            <h4>Owner</h4>
            <p>{caseItem.site?.towerOwner}</p>
          </div>
          <div className="simple">
            <h4>Latitude</h4>
            <p>{caseItem.site?.latitude}</p>
          </div>
        </div>

        <div className="complex">
          <div className="simple">
            <h4>Primary Vendor</h4>
            <p>{caseItem.site?.towerOwner}</p>
          </div>
          <div className="simple">
            <h4>Longitude</h4>
            <p>{caseItem.site?.longitude}</p>
          </div>
        </div>

        <div className="border"></div>

        <div className="across">
          <h5>Equipment Name</h5>
          <h5>{caseItem.equipment?.equipmentName}</h5>
        </div>

        <div className="across">
          <h5>Equipment Type</h5>
          <h5>{caseItem.equipment?.type}</h5>
        </div>

        <div className="across">
          <h5>Equipment Number</h5>
          <h5>{caseItem.equipment?.equipmentID}</h5>
        </div>

        <div className="across">
          <h5>Gate Code</h5>
          <h5>{caseItem.site?.gateCode}</h5>
        </div>

        <div className="across">
          <h5>Channels</h5>
          <h5>{caseItem.site?.channelCount}</h5>
        </div>

        <OverviewCases site={caseItem.siteId} />
      </div>
    </div>
  );
};

export default Overview;
