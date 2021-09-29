import React from "react";
import styled from "@emotion/styled";

import { margin, padding } from "../styles/_formatting";
import {
  smallTextStyle,
  regularTextStyle,
  largeBoldTextStyle,
} from "../styles/_typographies.js";

const DeleteModal = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.secondaryFillColor};
  ${padding("top", 3)}
  ${padding("right", 3)}
  ${padding("bottom", 3)}
  ${padding("left", 3)}
  ${regularTextStyle}
  color: ${(props) => props.theme.colors.secondary2};
  width: 420px;
`;

const DeleteModalTitle = styled.div`
  ${padding("bottom", 2)}
  ${largeBoldTextStyle}
`;

const DeleteBody = styled.div`
  display: flex;
  flex-direction: column;
  ${padding("bottom", 2)}
`;

const DeleteModalDesc = styled.div`
  ${regularTextStyle}
  ${padding("top", 1)}
  ${padding("bottom", 1)}
`;

const DeleteError = styled.span`
  ${smallTextStyle}
  color: ${(props) => props.theme.colors.deleteRed};
  ${padding("top", 1)}
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

const ConfirmDelete = ({ count = 1, errorMessage, onConfirm, onCancel }) => (
  <DeleteModal>
    <DeleteModalTitle>Confirm Delete</DeleteModalTitle>
    <DeleteBody>
      <DeleteModalDesc>
        {`Are you sure you want to delete ${
          count > 1 ? `${count} selected files` : "the file"
        }?`}
      </DeleteModalDesc>
      <DeleteError>{errorMessage}</DeleteError>
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
