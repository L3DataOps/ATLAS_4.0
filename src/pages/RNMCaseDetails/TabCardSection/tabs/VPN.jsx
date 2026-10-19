import { Fragment } from "react";

const VPN = ({ caseItem }) => {
  const instructions = caseItem?.customer?.vpnInstructions || "";

  // Split on "~" and put a line break between each piece
  const lines = instructions.split("~");

  return (
    <div>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {line.trim()}
          {index < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </div>
  );
};

export default VPN;
