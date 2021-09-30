import React from "react";
import styled from "@emotion/styled";
import { Folder } from "react-feather";

const EmptyDriveContainer = styled.div`
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EmptyDriveTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
`;

const EmptyDriveText = styled.div`
  padding-top: 20px;
  font-weight: bold;
`;

const EmptyDrive = ({ readOnly = false }) => (
  <EmptyDriveContainer>
    <Folder size={64} />
    <EmptyDriveTextContainer>
      <EmptyDriveText>Folder is empty!</EmptyDriveText>
      {!readOnly ? (
        <EmptyDriveText>Drag and drop a file to upload</EmptyDriveText>
      ) : null}
    </EmptyDriveTextContainer>
  </EmptyDriveContainer>
);

export default EmptyDrive;
