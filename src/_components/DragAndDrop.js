import React from "react";
import styled from "@emotion/styled";
import { Upload } from "react-feather";

const DragAndDropContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 999;
  opacity: 0.5;
`;

const DragAndDropTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
`;

const DragAndDropText = styled.div`
  padding-top: 20px;
  font-weight: bold;
`;

const DragAndDrop = () => (
  <DragAndDropContainer>
    <Upload size={64} />
    <DragAndDropTextContainer>
      <DragAndDropText>Drop a file to upload</DragAndDropText>
    </DragAndDropTextContainer>
  </DragAndDropContainer>
);

export default DragAndDrop;
