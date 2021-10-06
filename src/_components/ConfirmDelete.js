import React from "react";
import styled from "@emotion/styled";

import { margin, padding } from "../styles/_formatting";

const DeleteModal = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.secondaryBackgroundColor};
  ${padding("top", 3)}
  ${padding("right", 3)}
  ${padding("bottom", 3)}
  ${padding("left", 3)}
  font-size: 16px;
  line-height: 18px;
  color: ${(props) => props.theme.colors.secondary2};
  width: 420px;
`;

const DeleteModalTitle = styled.div`
  ${padding("bottom", 2)}
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
`;

const DeleteBody = styled.div`
  display: flex;
  flex-direction: column;
  ${padding("bottom", 2)}
`;

const DeleteModalDesc = styled.div`
  font-size: 16px;
  line-height: 18px;
  ${padding("top", 1)}
  ${padding("bottom", 1)}
`;

const DeleteModalFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export const DeleteButton = styled.button`
  ${margin("left", 2)};
  height: 25px;
  width: 75px;
  border-radius: 0.125rem;
  background-color: transparent;
  ${({ theme, isConfirmed = false }) =>
    isConfirmed
      ? `
      color: ${theme.colors.deleteRed};
      border: 1px solid ${theme.colors.deleteRed};
      &:hover {
        cursor: pointer;
        border: 1px solid ${theme.colors.primary};
        color: ${theme.colors.primary};
      }
    `
      : `
      color: ${theme.colors.secondary1};
      border: 1px solid ${theme.colors.secondary};
      &:hover {
        cursor: not-allowed;
      }
    `}
`;

const Button = styled.button`
  ${margin("left", 2)};
  height: 25px;
  border-radius: 0.125rem;
  padding: 0 10px;
  background-color: transparent;
  ${({ theme, disabled = false }) =>
    disabled
      ? `
      color: ${theme.colors.tertiary};
      border: 1px solid ${theme.colors.tertiary};
      &:hover {
        cursor: not-allowed;
      }
    `
      : `
      color: ${theme.colors.secondary1};
      border: 1px solid ${theme.colors.secondary};
      &:hover {
        cursor: pointer;
        border: 1px solid ${theme.colors.primary};
        color: ${theme.colors.primary};
      }
    `}
`;

const ConfirmDelete = ({ count = 1, onConfirm, onCancel }) => (
  <DeleteModal>
    <DeleteModalTitle>Confirm Deletion</DeleteModalTitle>
    <DeleteBody>
      <DeleteModalDesc>
        {`Are you sure you want to delete ${
          count > 1 ? `the ${count} selected files` : "the selected file"
        }?`}
      </DeleteModalDesc>
    </DeleteBody>
    <DeleteModalFooter>
      <DeleteButton alt="Delete" title="Delete" isConfirmed onClick={onConfirm}>
        Delete
      </DeleteButton>
      <Button alt="Cancel" title="Cancel" onClick={onCancel}>
        Cancel
      </Button>
    </DeleteModalFooter>
  </DeleteModal>
);

export default ConfirmDelete;
